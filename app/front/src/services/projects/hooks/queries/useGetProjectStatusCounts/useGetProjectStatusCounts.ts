import { useQuery } from "@tanstack/react-query";

import { projectKeys } from "../../../query-keys";
import { getProjectStatusCounts } from "../../../requests";

/**
 * Contadores globais da barra de filtros.
 *
 * <p>Query separada da listagem porque os números não mudam ao paginar nem ao
 * buscar — juntos, a agregação era refeita a cada tecla digitada.
 */
export const useGetProjectStatusCounts = () =>
	useQuery({
		queryKey: projectKeys.statusCounts(),
		queryFn: getProjectStatusCounts,
	});
