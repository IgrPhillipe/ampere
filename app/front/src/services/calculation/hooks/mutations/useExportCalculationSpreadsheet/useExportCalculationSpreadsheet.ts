import { getToastErrorMessage } from "@lib/api-error";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { exportCalculationSpreadsheet } from "../../../requests";

export const useExportCalculationSpreadsheet = () =>
	useMutation({
		mutationFn: exportCalculationSpreadsheet,
		onError: (error) =>
			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível exportar a planilha do cálculo.",
				}),
			),
	});
