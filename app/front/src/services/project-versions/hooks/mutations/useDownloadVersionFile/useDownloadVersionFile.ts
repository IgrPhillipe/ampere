import { getToastErrorMessage } from "@lib/api-error";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { getVersionFile } from "../../../requests";

/** Fetched on demand: each version holds its own memorial and documents. */
export const useDownloadVersionFile = () =>
	useMutation({
		mutationFn: getVersionFile,
		onError: (error) =>
			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível baixar o arquivo da versão.",
				}),
			),
	});
