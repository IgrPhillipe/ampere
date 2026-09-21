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
	const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);

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

	const clearFilters = useCallback(() => {
		void setStatusQuery(null);
		void setSearchQuery(null);
		void setPageQuery(null);
	}, [setStatusQuery, setSearchQuery, setPageQuery]);

	return {
		status,
		search,
		debouncedSearch,
		page,
		// An empty list under an active filter asks for "Limpar filtros"; without one, it does not.
		hasActiveFilters: status !== null || search.trim() !== "",
		setStatus,
		setSearch,
		setPage,
		clearFilters,
	};
};
