import { getToastErrorMessage } from "@lib/api-error";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { login } from "../../../requests";
import { useStartSession } from "../../useStartSession";

interface UseLoginOptions {
	/** Route to return to after login, taken from `?redirect=`. */
	redirectTo?: string;
}

export const useLogin = ({ redirectTo }: UseLoginOptions = {}) => {
	const startSession = useStartSession();

	return useMutation({
		mutationFn: login,
		onSuccess: ({ data }) => startSession(data, redirectTo),
		onError: (error) =>
			toast.error(
				getToastErrorMessage(error, {
					fallback: "Nao foi possivel entrar. Verifique suas credenciais.",
				}),
			),
	});
};
