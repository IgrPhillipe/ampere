import { useDebouncedValue } from "@features/shared";
import { type ProjectStatus, projectStatusSchema } from "@services/projects";
import {
	debounce,
	parseAsInteger,
	parseAsString,
	parseAsStringLiteral,
	useQueryState,
} from "nuqs";
import { useCallback } from "react";

const SEARCH_DEBOUNCE_MS = 350;

export const useProjectFilters = () => {
	// `null` e "todos": o parser do nuqs ja devolve null quando a chave nao
	// esta na URL, entao nao ha sentinela "ALL" para converter em tres pontos.
	const [status, setStatusQuery] = useQueryState(
		"status",
		parseAsStringLiteral(projectStatusSchema.options),
	);
	const [search, setSearchQuery] = useQueryState(
		"search",
		parseAsString
			.withDefault("")
			.withOptions({ limitUrlUpdates: debounce(SEARCH_DEBOUNCE_MS) }),
	);
	const [page, setPageQuery] = useQueryState(
		"page",
		parseAsInteger.withDefault(1),
	);
	/**
	 * Dois debounces, trabalhos diferentes: o `limitUrlUpdates` adia a escrita
	 * na URL (o valor devolvido e imediato, entao o campo responde na tecla) e
	 * este segura a query. Tirar um nao substitui o outro.
	 */
	const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);

	/**
	 * Os setters devolvem `void`, nao a promessa do nuqs: ninguem aguardava, e
	 * os quatro `void` que descartavam o retorno so escondiam isso. `useCallback`
	 * mantem a identidade estavel — os setters do nuqs ja sao — para a pagina
	 * poder passar a referencia direto, sem arrow recriada a cada render.
	 */
	const setStatus = useCallback(
		(status: ProjectStatus | null) => {
			void setStatusQuery(status);
			void setPageQuery(null);
		},
		[setStatusQuery, setPageQuery],
	);

	const setSearch = useCallback(
		(value: string) => {
			void setSearchQuery(value || null);
			void setPageQuery(null);
		},
		[setSearchQuery, setPageQuery],
	);

	const setPage = useCallback(
		(nextPage: number) => {
			void setPageQuery(nextPage);
		},
		[setPageQuery],
	);

	return {
		status,
		search,
		debouncedSearch,
		page,
		setStatus,
		setSearch,
		setPage,
	};
};
