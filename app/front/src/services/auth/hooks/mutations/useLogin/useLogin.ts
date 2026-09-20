import { useAuthStore } from "@features/shared";
import { getToastErrorMessage } from "@lib/api-error";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { login } from "../../../requests";

interface UseLoginOptions {
	/** Rota para onde voltar depois do login, vinda de `?redirect=`. */
	redirectTo?: string;
}

export const useLogin = ({ redirectTo }: UseLoginOptions = {}) => {
	const navigate = useNavigate();
	const setSession = useAuthStore((state) => state.login);

	return useMutation({
		mutationFn: login,
		onSuccess: ({ data }) => {
			setSession({ ...data.user, token: data.token });

			navigate({ to: redirectTo ?? "/" });

			toast.success(`Bem-vindo, ${data.user.name}.`);
		},
		onError: (error) =>
			toast.error(
				getToastErrorMessage(error, {
					fallback: "Nao foi possivel entrar. Verifique suas credenciais.",
				}),
			),
	});
};
