import {
	extractApiDetail,
	getApiFieldErrors,
	getHttpStatus,
} from "@lib/api-error";
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

/**
 * Puts the API errors on the form fields: the bean validation errors of a 400
 * by field name, and a whole status (a 409 on the e-mail) on the given field.
 * Returns whether any field got an error, so the caller can skip the toast.
 */
export const setApiFieldErrors = <T extends FieldValues>(
	form: UseFormReturn<T>,
	error: unknown,
	fieldByStatus: Partial<Record<number, FieldPath<T>>> = {},
): boolean => {
	const status = getHttpStatus(error);
	const statusField = status === undefined ? undefined : fieldByStatus[status];
	const statusMessage = extractApiDetail(error);

	if (statusField && statusMessage) {
		form.setError(
			statusField,
			{ message: statusMessage },
			{ shouldFocus: true },
		);

		return true;
	}

	const formFields = Object.keys(form.getValues());
	const fieldErrors = getApiFieldErrors(error).filter(({ field }) =>
		formFields.includes(field),
	);

	fieldErrors.forEach(({ field, message }, index) =>
		form.setError(
			field as FieldPath<T>,
			{ message },
			{ shouldFocus: index === 0 },
		),
	);

	return fieldErrors.length > 0;
};
