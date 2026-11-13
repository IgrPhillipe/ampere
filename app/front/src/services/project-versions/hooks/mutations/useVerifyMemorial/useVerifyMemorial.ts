import { getToastErrorMessage } from "@lib/api-error";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { verifyMemorialByCode, verifyMemorialByFile } from "../../../requests";

export type VerifyMemorialInput =
	| { by: "code"; code: string }
	| { by: "file"; file: File };

/** A memorial that matches nothing is an answer, not an error: `verified` says it. */
export const useVerifyMemorial = () =>
	useMutation({
		mutationFn: (input: VerifyMemorialInput) =>
			input.by === "code"
				? verifyMemorialByCode(input.code)
				: verifyMemorialByFile(input.file),
		onError: (error) =>
			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível verificar o memorial.",
				}),
			),
	});
