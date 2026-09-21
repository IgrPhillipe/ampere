import { QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getToastErrorMessage } from "./api-error";

export const queryClient = new QueryClient({
	/** A query error becomes a toast without every hook needing an `onError`. */
	queryCache: new QueryCache({
		onError: (error) => {
			const message = getToastErrorMessage(error, {
				fallback: "Nao foi possivel carregar os dados. Tente novamente.",
			});

			toast.error(message, { id: message });
		},
	}),
	defaultOptions: {
		queries: { staleTime: 60_000, retry: 1 },
	},
});
