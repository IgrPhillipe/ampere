import {
	type HTTPError,
	isHTTPError,
	isNetworkError,
	isTimeoutError,
} from "ky";

export const INTERNAL_ERROR_MESSAGE = "Erro interno. Tente novamente.";
export const NETWORK_ERROR_MESSAGE =
	"Nao foi possivel falar com o servidor. Verifique sua conexao.";

/** Bean validation error item (`MethodArgumentNotValidException`). */
interface SpringFieldError {
	field?: string;
	defaultMessage?: string;
	message?: string;
}

interface SpringErrorBody {
	detail?: string;
	title?: string;
	message?: string;
	error?: string;
	errors?: SpringFieldError[];
}

export type ApiHTTPError = HTTPError & { apiDetail?: string };

/** Messages Boot returns when it has nothing useful to say. */
const NOISE = new Set(["no message available", "no description available", ""]);

const clean = (value: unknown): string | undefined => {
	if (typeof value !== "string") return undefined;

	const trimmed = value.trim();

	return trimmed && !NOISE.has(trimmed.toLowerCase()) ? trimmed : undefined;
};

/** Normalizes Spring's error JSON into a single string. */
export const parseSpringErrorBody = (
	body: SpringErrorBody,
): string | undefined => {
	const [first] = body.errors ?? [];
	const fieldMessage = clean(first?.defaultMessage) ?? clean(first?.message);

	if (fieldMessage) {
		const field = clean(first?.field);

		return field ? `${field}: ${fieldMessage}` : fieldMessage;
	}

	return clean(body.detail) ?? clean(body.message) ?? clean(body.title);
};

/** Transport noise that must not reach the user. */
const isTechnicalMessage = (message: string): boolean => {
	const lower = message.toLowerCase();

	return (
		lower.startsWith("request failed") ||
		lower.startsWith("http error") ||
		lower.includes("status code") ||
		lower.startsWith("failed to fetch") ||
		lower.includes("is not valid json") ||
		lower.includes("unexpected end of json input") ||
		lower.startsWith("unexpected token")
	);
};

/** Stack trace or internal detail leaked by the back-end. */
const isInternalLeakMessage = (message: string): boolean => {
	const lower = message.toLowerCase();

	return (
		lower.includes("java.lang.") ||
		lower.includes("java.util.") ||
		lower.includes("org.springframework") ||
		lower.includes("nested exception") ||
		lower.includes("could not execute statement") ||
		/\bexception\b/.test(lower) ||
		/\bat [\w.$]+\([\w.]+:\d+\)/.test(message)
	);
};

const isUserFacingDetail = (detail: string): boolean =>
	Boolean(detail.trim()) &&
	!isTechnicalMessage(detail) &&
	!isInternalLeakMessage(detail);

export const extractApiDetail = (error: unknown): string | undefined => {
	if (isHTTPError(error)) {
		const withDetail = error as ApiHTTPError;
		const cached = clean(withDetail.apiDetail);

		if (cached) return cached;

		if (error.data != null && typeof error.data === "object") {
			const fromData = parseSpringErrorBody(error.data as SpringErrorBody);

			if (fromData) return fromData;
		}
	}

	if (error instanceof Error) {
		const message = clean(error.message);

		if (message && !isTechnicalMessage(message)) return message;
	}

	return undefined;
};

export const getHttpStatus = (error: unknown): number | undefined =>
	isHTTPError(error) ? error.response.status : undefined;

interface ToastErrorOptions {
	fallback: string;
}

export const getToastErrorMessage = (
	error: unknown,
	options: ToastErrorOptions,
): string => {
	if (isNetworkError(error) || isTimeoutError(error)) {
		return NETWORK_ERROR_MESSAGE;
	}

	if (error instanceof SyntaxError) return INTERNAL_ERROR_MESSAGE;

	const status = getHttpStatus(error);

	if (status != null && status >= 500) return INTERNAL_ERROR_MESSAGE;

	const detail = extractApiDetail(error);

	if (detail && isUserFacingDetail(detail)) return detail;

	return options.fallback;
};
