import { PROJECT_SORT_DIRECTIONS } from "@features/projects";
import {
	type ListSort,
	nextSort,
	sortDirectionSchema,
	useDebouncedValue,
} from "@features/shared";
import {
	type ListProjectsParams,
	type ProjectSort,
	projectSortSchema,
} from "@services/projects";
import {
	parseAsInteger,
	parseAsString,
	parseAsStringLiteral,
	useQueryStates,
} from "nuqs";
import { useCallback, useMemo } from "react";

import { ACTIVE_PROJECT_STATUSES } from "../../constants";

const SEARCH_DEBOUNCE_MS = 350;

const DEFAULT_SORT: ProjectSort = "updatedAt";

export const useActiveProjectFilters = () => {
	const [query, setQuery] = useQueryStates({
		search: parseAsString.withDefault(""),
		owner: parseAsString,
		page: parseAsInteger.withDefault(1),
		sort: parseAsStringLiteral(projectSortSchema.options).withDefault(
			DEFAULT_SORT,
		),
		direction: parseAsStringLiteral(sortDirectionSchema.options),
	});
	const { search, owner, page } = query;
	const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);

	const sort = useMemo<ListSort<ProjectSort>>(
		() => ({
			column: query.sort,
			direction: query.direction ?? PROJECT_SORT_DIRECTIONS[query.sort],
		}),
		[query.sort, query.direction],
	);

	const params = useMemo<Omit<ListProjectsParams, "pageSize">>(
		() => ({
			status: ACTIVE_PROJECT_STATUSES,
			search: debouncedSearch || undefined,
			owner: owner ?? undefined,
			sort: sort.column,
			direction: sort.direction,
			page,
		}),
		[debouncedSearch, owner, sort, page],
	);

	const setSearch = useCallback(
		(value: string) => {
			void setQuery({ search: value || null, page: null });
		},
		[setQuery],
	);

	const setOwner = useCallback(
		(value: string | null) => {
			void setQuery({ owner: value, page: null });
		},
		[setQuery],
	);

	const setPage = useCallback(
		(value: number) => {
			void setQuery({ page: value });
		},
		[setQuery],
	);

	const sortBy = useCallback(
		(column: ProjectSort) => {
			const next = nextSort(sort, column, PROJECT_SORT_DIRECTIONS);

			void setQuery({
				sort: next.column === DEFAULT_SORT ? null : next.column,
				direction:
					next.direction === PROJECT_SORT_DIRECTIONS[next.column]
						? null
						: next.direction,
				page: null,
			});
		},
		[sort, setQuery],
	);

	const clearFilters = useCallback(() => {
		void setQuery({ search: null, owner: null, page: null });
	}, [setQuery]);

	return {
		search,
		owner,
		sort,
		params,
		hasActiveFilters: search.trim() !== "" || owner !== null,
		setSearch,
		setOwner,
		setPage,
		sortBy,
		clearFilters,
	};
};
