import { getToastErrorMessage } from "@lib/api-error";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { exportReviewQueueCsv } from "../../../requests";

export const useExportReviewQueueCsv = () =>
	useMutation({
		mutationFn: exportReviewQueueCsv,
		onError: (error) =>
			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível exportar a fila de análise.",
				}),
			),
	});
