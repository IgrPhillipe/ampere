import { getToastErrorMessage } from "@lib/api-error";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { exportProjectListCsv } from "../../../requests";

export const useExportProjectListCsv = () =>
	useMutation({
		mutationFn: exportProjectListCsv,
		onError: (error) =>
			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível exportar os projetos.",
				}),
			),
	});
