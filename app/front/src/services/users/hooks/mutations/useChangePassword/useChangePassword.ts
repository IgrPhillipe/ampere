import { getToastErrorMessage } from "@lib/api-error";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { changePassword } from "../../../requests";

export const useChangePassword = () =>
	useMutation({
		mutationFn: changePassword,
		onSuccess: () => {
			toast.success("Senha alterada com sucesso.");
		},
		onError: (error) =>
			toast.error(
				getToastErrorMessage(error, {
					fallback:
						"Não foi possível alterar a senha. Verifique a senha atual.",
				}),
			),
	});
