import {
	getApiFieldErrors,
	getHttpStatus,
	getToastErrorMessage,
} from "@lib/api-error";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { register } from "../../../requests";
import { useStartSession } from "../../useStartSession";

export const useRegister = () => {
	const startSession = useStartSession();

	return useMutation({
		mutationFn: register,
		onSuccess: ({ data }) => startSession(data),
		onError: (error) => {
			// The form shows these on the fields.
			if (getHttpStatus(error) === 409 || getApiFieldErrors(error).length) {
				return;
			}

			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível criar a conta. Verifique seus dados.",
				}),
			);
		},
	});
};
