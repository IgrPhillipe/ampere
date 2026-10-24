import type { DateRange } from "@components/DateRangeFilter";
import {
	type ListSort,
	nextSort,
	type SortDirections,
	sortDirectionSchema,
	useDebouncedValue,
} from "@features/shared";
import dayjs from "@lib/dayjs";
import { type BrazilianState, brazilianStateSchema } from "@services/locations";
import {
	type ListProjectsParams,
	type ProjectFindingsFilter,
	type ProjectSort,
	type ProjectStatus,
	projectFindingsFilterSchema,
	projectSortSchema,
	projectStatusSchema,
} from "@services/projects";
import {
	debounce,
	parseAsArrayOf,
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
		state: parseAsArrayOf(
			parseAsStringLiteral(brazilianStateSchema.options),
		).withDefault([]),
		municipality: parseAsArrayOf(parseAsString).withDefault([]),
		createdFrom: parseAsString,
		createdTo: parseAsString,
		findings: parseAsArrayOf(
			parseAsStringLiteral(projectFindingsFilterSchema.options),
		).withDefault([]),
	});
	const { status, search, page, state, municipality, findings } = query;
	const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);

	const sort = useMemo<ListSort<ProjectSort>>(
		() => ({
			column: query.sort,
			direction: query.direction ?? PROJECT_SORT_DIRECTIONS[query.sort],
		}),
		[query.sort, query.direction],
	);

	const period = useMemo<DateRange>(() => {
		const from = toIsoDate(query.createdFrom);
		const to = toIsoDate(query.createdTo);

		// An inverted period from a hand-edited URL would come back as a 400; the start wins.
		return { from, to: from && to && to < from ? null : to };
	}, [query.createdFrom, query.createdTo]);

	const params = useMemo<Omit<ListProjectsParams, "pageSize">>(
		() => ({
			page,
			status: status ?? undefined,
			search: debouncedSearch || undefined,
			sort: sort.column,
			direction: sort.direction,
			state: state.length ? state : undefined,
			municipality: municipality.length ? municipality : undefined,
			createdFrom: period.from ?? undefined,
			createdTo: period.to ?? undefined,
			findings: findings.length ? findings : undefined,
		}),
		[
			page,
			status,
			debouncedSearch,
			sort,
			state,
			municipality,
			period,
			findings,
		],
	);

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

	const setState = useCallback(
		(value: BrazilianState[]) => {
			void setQuery({
				state: value.length ? value : null,
				municipality: null,
				page: null,
			});
		},
		[setQuery],
	);

	const setMunicipality = useCallback(
		(value: string[]) => {
			void setQuery({ municipality: value.length ? value : null, page: null });
		},
		[setQuery],
	);

	const setPeriod = useCallback(
		({ from, to }: DateRange) => {
			void setQuery({
				createdFrom: toIsoDate(from),
				createdTo: toIsoDate(to),
				page: null,
			});
		},
		[setQuery],
	);

	const setFindings = useCallback(
		(value: ProjectFindingsFilter[]) => {
			void setQuery({ findings: value.length ? value : null, page: null });
		},
		[setQuery],
	);

	const clearFilters = useCallback(() => {
		void setQuery({
			status: null,
			search: null,
			state: null,
			municipality: null,
			createdFrom: null,
			createdTo: null,
			findings: null,
			page: null,
		});
	}, [setQuery]);

	return {
		status,
		search,
		page,
		sort,
		state,
		municipality,
		period,
		findings,
		params,
		// An empty list under an active filter asks for "Limpar Filtros"; without one, it does not.
		hasActiveFilters:
			status !== null ||
			search.trim() !== "" ||
			state.length > 0 ||
			municipality.length > 0 ||
			period.from !== null ||
			period.to !== null ||
			findings.length > 0,
		setStatus,
		setSearch,
		setPage,
		setSort,
		sortBy,
		setState,
		setMunicipality,
		setPeriod,
		setFindings,
		clearFilters,
	};
};
