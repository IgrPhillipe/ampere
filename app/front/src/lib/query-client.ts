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
		onError: (error) => {
			const message = getToastErrorMessage(error, {
				fallback: "Nao foi possivel carregar os dados. Tente novamente.",
			});

			// A mensagem e o id: uma tela com duas queries que falham pelo mesmo
			// motivo — API fora do ar — empilhava dois toasts identicos.
			toast.error(message, { id: message });
		},
	}),
	defaultOptions: {
		/**
		 * `retry: 1` e a unica camada de repeticao do app: o ky nao repete mais
		 * (ver `lib/http.ts`). Somadas, as duas levavam um GET com falha a seis
		 * tentativas antes de a tela dizer qualquer coisa.
		 *
		 * O retryer do React Query nao continua uma repeticao enquanto
		 * `document.visibilityState` e `hidden` — e por isso que, numa aba de
		 * fundo, a query fica em `fetchStatus: "paused"` ate a aba voltar. E o
		 * comportamento pretendido da biblioteca, nao defeito daqui.
		 */
		queries: { staleTime: 60_000, retry: 1 },
	},
});
