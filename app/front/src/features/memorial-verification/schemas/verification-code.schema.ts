import { z } from "zod";

/** 16 hexadecimal digits, typed with or without the dashes of the footer. */
export const normalizeVerificationCode = (typed: string) => {
	const digits = typed.replace(/[^0-9a-z]/gi, "").toUpperCase();

	return digits.replace(/(.{4})(?=.)/g, "$1-");
};

export const verificationCodeSchema = z.object({
	code: z
		.string()
		.trim()
		.min(1, { error: "Informe o código do rodapé do memorial." })
		.refine(
			(value) =>
				/^[0-9A-F]{16}$/.test(value.replace(/[^0-9a-z]/gi, "").toUpperCase()),
			{ error: "O código tem 16 caracteres, como 7F3A-91C2-04BD-2E77." },
		),
});

export type VerificationCodeValues = z.infer<typeof verificationCodeSchema>;
