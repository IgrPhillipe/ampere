import {
	getApiFieldErrors,
	getHttpStatus,
	getToastErrorMessage,
} from "@lib/api-error";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { changePassword } from "../../../requests";

export const useChangePassword = () =>
	useMutation({
		mutationFn: changePassword,
		onSuccess: () => {
			toast.success("Senha alterada com sucesso.");
		},
		onError: (error) => {
			// The form shows these on the fields.
			if (getHttpStatus(error) === 422 || getApiFieldErrors(error).length) {
				return;
			}

			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível alterar a senha.",
				}),
			);
		},
	});
