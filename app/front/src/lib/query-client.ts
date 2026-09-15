import { QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getToastErrorMessage } from "./api-error";

export const queryClient = new QueryClient({
	/**
	 * Erro de query vira toast sem que cada hook precise de um `onError`.
	 * Mutations continuam tratando o proprio erro, porque a mensagem de
	 * sucesso e a navegacao costumam ser especificas.
	 */
	queryCache: new QueryCache({
		onError: (error) =>
			toast.error(
				getToastErrorMessage(error, {
					fallback: "Nao foi possivel carregar os dados. Tente novamente.",
				}),
			),
	}),
	defaultOptions: {
		queries: { staleTime: 60_000, retry: 1 },
	},
});
