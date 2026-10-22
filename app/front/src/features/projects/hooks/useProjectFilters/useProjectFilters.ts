import {
	type ListSort,
	nextSort,
	type SortDirections,
	sortDirectionSchema,
	useDebouncedValue,
} from "@features/shared";
import dayjs from "@lib/dayjs";
import {
	type ProjectSort,
	type ProjectStatus,
	projectSortSchema,
	projectStatusSchema,
} from "@services/projects";
import {
	debounce,
	parseAsBoolean,
	parseAsInteger,
	parseAsString,
	parseAsStringLiteral,
	useQueryStates,
} from "nuqs";
import { useCallback, useMemo } from "react";

const SEARCH_DEBOUNCE_MS = 350;

const DEFAULT_SORT: ProjectSort = "updatedAt";

export const PROJECT_SORT_DIRECTIONS: SortDirections<ProjectSort> = {
	name: "ASC",
	demand: "DESC",
	createdAt: "DESC",
	updatedAt: "DESC",
};

export type ProjectFilters = ReturnType<typeof useProjectFilters>;

const toIsoDate = (value: string | null) =>
	value && dayjs(value, "YYYY-MM-DD", true).isValid() ? value : null;

export const useProjectFilters = () => {
	const [query, setQuery] = useQueryStates({
		status: parseAsStringLiteral(projectStatusSchema.options),
		search: parseAsString
			.withDefault("")
			.withOptions({ limitUrlUpdates: debounce(SEARCH_DEBOUNCE_MS) }),
		page: parseAsInteger.withDefault(1),
		sort: parseAsStringLiteral(projectSortSchema.options).withDefault(
			DEFAULT_SORT,
		),
		direction: parseAsStringLiteral(sortDirectionSchema.options),
		municipality: parseAsString,
		createdFrom: parseAsString,
		createdTo: parseAsString,
		hasBlocking: parseAsBoolean.withDefault(false),
	});
	const { status, search, page, municipality, hasBlocking } = query;
	const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);

	const sort = useMemo<ListSort<ProjectSort>>(
		() => ({
			column: query.sort,
			direction: query.direction ?? PROJECT_SORT_DIRECTIONS[query.sort],
		}),
		[query.sort, query.direction],
	);

	const createdFrom = toIsoDate(query.createdFrom);
	const parsedCreatedTo = toIsoDate(query.createdTo);
	// An inverted period from a hand-edited URL would come back as a 400; the start wins.
	const createdTo =
		createdFrom && parsedCreatedTo && parsedCreatedTo < createdFrom
			? null
			: parsedCreatedTo;

	const setStatus = useCallback(
		(nextStatus: ProjectStatus | null) => {
			void setQuery({ status: nextStatus, page: null });
		},
		[setQuery],
	);

	const setSearch = useCallback(
		(value: string) => {
			void setQuery({ search: value || null, page: null });
		},
		[setQuery],
	);

	const setPage = useCallback(
		(nextPage: number) => {
			void setQuery({ page: nextPage });
		},
		[setQuery],
	);

	const setSort = useCallback(
		({ column, direction }: ListSort<ProjectSort>) => {
			void setQuery({
				sort: column === DEFAULT_SORT ? null : column,
				direction:
					direction === PROJECT_SORT_DIRECTIONS[column] ? null : direction,
				page: null,
			});
		},
		[setQuery],
	);

	const sortBy = useCallback(
		(column: ProjectSort) => {
			setSort(nextSort(sort, column, PROJECT_SORT_DIRECTIONS));
		},
		[sort, setSort],
	);

	const setMunicipality = useCallback(
		(value: string | null) => {
			void setQuery({ municipality: value, page: null });
		},
		[setQuery],
	);

	const setCreatedFrom = useCallback(
		(value: string | null) => {
			const from = toIsoDate(value);

			void setQuery({
				createdFrom: from,
				...(from && createdTo && createdTo < from ? { createdTo: null } : {}),
				page: null,
			});
		},
		[createdTo, setQuery],
	);

	const setCreatedTo = useCallback(
		(value: string | null) => {
			const to = toIsoDate(value);

			void setQuery({
				createdTo: to,
				...(to && createdFrom && to < createdFrom ? { createdFrom: null } : {}),
				page: null,
			});
		},
		[createdFrom, setQuery],
	);

	const clearPeriod = useCallback(() => {
		void setQuery({ createdFrom: null, createdTo: null, page: null });
	}, [setQuery]);

	const setHasBlocking = useCallback(
		(value: boolean) => {
			void setQuery({ hasBlocking: value || null, page: null });
		},
		[setQuery],
	);

	const clearFilters = useCallback(() => {
		void setQuery({
			status: null,
			search: null,
			municipality: null,
			createdFrom: null,
			createdTo: null,
			hasBlocking: null,
			page: null,
		});
	}, [setQuery]);

	return {
		status,
		search,
		debouncedSearch,
		page,
		sort,
		municipality,
		createdFrom,
		createdTo,
		hasBlocking,
		// An empty list under an active filter asks for "Limpar Filtros"; without one, it does not.
		hasActiveFilters:
			status !== null ||
			search.trim() !== "" ||
			municipality !== null ||
			createdFrom !== null ||
			createdTo !== null ||
			hasBlocking,
		setStatus,
		setSearch,
		setPage,
		setSort,
		sortBy,
		setMunicipality,
		setCreatedFrom,
		setCreatedTo,
		clearPeriod,
		setHasBlocking,
		clearFilters,
	};
};
