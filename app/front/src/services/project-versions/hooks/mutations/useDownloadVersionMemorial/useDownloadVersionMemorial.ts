import { getToastErrorMessage } from "@lib/api-error";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { getVersionMemorial } from "../../../requests";

/** Fetched on demand: each version holds a PDF of its own. */
export const useDownloadVersionMemorial = () =>
	useMutation({
		mutationFn: getVersionMemorial,
		onError: (error) =>
			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível baixar o memorial da versão.",
				}),
			),
	});
