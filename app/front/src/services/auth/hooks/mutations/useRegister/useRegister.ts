import { useAuthStore } from "@features/shared";
import { getToastErrorMessage } from "@lib/api-error";
import { getRoleHomePath } from "@lib/route-guard";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { register } from "../../../requests";

export const useRegister = () => {
	const navigate = useNavigate();
	const setSession = useAuthStore((state) => state.login);

	return useMutation({
		mutationFn: register,
		onSuccess: ({ data }) => {
			setSession({ ...data.user, token: data.token });
			navigate({ to: getRoleHomePath(data.user.role) });
			toast.success(`Bem-vindo, ${data.user.name}.`);
		},
		onError: (error) =>
			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível criar a conta. Verifique seus dados.",
				}),
			),
	});
};
