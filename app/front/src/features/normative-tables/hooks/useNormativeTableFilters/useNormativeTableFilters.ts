import {
	type ListSort,
	type SortDirections,
	sortDirectionSchema,
	useDebouncedValue,
} from "@features/shared";
import {
	type ListNormativeTablesParams,
	type NormativeStandardFilter,
	type NormativeTableSort,
	type NormativeTableStatus,
	normativeStandardFilterSchema,
	normativeTableSortSchema,
	normativeTableStatusSchema,
} from "@services/normative-tables";
import {
	debounce,
	parseAsArrayOf,
	parseAsString,
	parseAsStringLiteral,
	useQueryStates,
} from "nuqs";
import { useCallback, useMemo } from "react";

const SEARCH_DEBOUNCE_MS = 350;

const DEFAULT_SORT: NormativeTableSort = "code";

export const NORMATIVE_TABLE_SORT_DIRECTIONS: SortDirections<NormativeTableSort> =
	{
		code: "ASC",
		title: "ASC",
		registeredAt: "DESC",
		verifiedAt: "DESC",
	};

export type NormativeTableFilters = ReturnType<typeof useNormativeTableFilters>;

export const useNormativeTableFilters = () => {
	const [query, setQuery] = useQueryStates({
		search: parseAsString
			.withDefault("")
			.withOptions({ limitUrlUpdates: debounce(SEARCH_DEBOUNCE_MS) }),
		status: parseAsArrayOf(
			parseAsStringLiteral(normativeTableStatusSchema.options),
		).withDefault([]),
		standard: parseAsArrayOf(
			parseAsStringLiteral(normativeStandardFilterSchema.options),
		).withDefault([]),
		sort: parseAsStringLiteral(normativeTableSortSchema.options).withDefault(
			DEFAULT_SORT,
		),
		direction: parseAsStringLiteral(sortDirectionSchema.options),
	});
	const { search, status, standard } = query;
	const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);

	const sort = useMemo<ListSort<NormativeTableSort>>(
		() => ({
			column: query.sort,
			direction: query.direction ?? NORMATIVE_TABLE_SORT_DIRECTIONS[query.sort],
		}),
		[query.sort, query.direction],
	);

	const params = useMemo<ListNormativeTablesParams>(
		() => ({
			search: debouncedSearch || undefined,
			status: status.length ? status : undefined,
			standard: standard.length ? standard : undefined,
			sort: sort.column,
			direction: sort.direction,
		}),
		[debouncedSearch, status, standard, sort],
	);

	const setSearch = useCallback(
		(value: string) => {
			void setQuery({ search: value || null });
		},
		[setQuery],
	);

	const setStatus = useCallback(
		(value: NormativeTableStatus[]) => {
			void setQuery({ status: value.length ? value : null });
		},
		[setQuery],
	);

	const setStandard = useCallback(
		(value: NormativeStandardFilter[]) => {
			void setQuery({ standard: value.length ? value : null });
		},
		[setQuery],
	);

	const setSort = useCallback(
		({ column, direction }: ListSort<NormativeTableSort>) => {
			void setQuery({
				sort: column === DEFAULT_SORT ? null : column,
				direction:
					direction === NORMATIVE_TABLE_SORT_DIRECTIONS[column]
						? null
						: direction,
			});
		},
		[setQuery],
	);

	const clearFilters = useCallback(() => {
		void setQuery({ search: null, status: null, standard: null });
	}, [setQuery]);

	return {
		search,
		status,
		standard,
		sort,
		params,
		hasActiveFilters:
			search.trim() !== "" || status.length > 0 || standard.length > 0,
		setSearch,
		setStatus,
		setStandard,
		setSort,
		clearFilters,
	};
};
