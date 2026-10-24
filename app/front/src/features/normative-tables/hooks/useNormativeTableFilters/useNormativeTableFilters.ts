import {
	type ListSort,
	nextSort,
	type SortDirections,
	sortDirectionSchema,
	useDebouncedValue,
} from "@features/shared";
import {
	type ListNormativeTablesParams,
	type NormativeTableSort,
	type NormativeTableStatus,
	normativeTableSortSchema,
	normativeTableStatusSchema,
} from "@services/normative-tables";
import {
	debounce,
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
		registeredAt: "DESC",
		verifiedAt: "DESC",
	};

export type NormativeTableFilters = ReturnType<typeof useNormativeTableFilters>;

export const useNormativeTableFilters = () => {
	const [query, setQuery] = useQueryStates({
		search: parseAsString
			.withDefault("")
			.withOptions({ limitUrlUpdates: debounce(SEARCH_DEBOUNCE_MS) }),
		status: parseAsStringLiteral(normativeTableStatusSchema.options),
		sort: parseAsStringLiteral(normativeTableSortSchema.options).withDefault(
			DEFAULT_SORT,
		),
		direction: parseAsStringLiteral(sortDirectionSchema.options),
	});
	const { search, status } = query;
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
			status: status ?? undefined,
			sort: sort.column,
			direction: sort.direction,
		}),
		[debouncedSearch, status, sort],
	);

	const setSearch = useCallback(
		(value: string) => {
			void setQuery({ search: value || null });
		},
		[setQuery],
	);

	const setStatus = useCallback(
		(value: NormativeTableStatus | null) => {
			void setQuery({ status: value });
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

	const sortBy = useCallback(
		(column: NormativeTableSort) => {
			setSort(nextSort(sort, column, NORMATIVE_TABLE_SORT_DIRECTIONS));
		},
		[sort, setSort],
	);

	const clearFilters = useCallback(() => {
		void setQuery({ search: null, status: null });
	}, [setQuery]);

	return {
		search,
		status,
		sort,
		params,
		hasActiveFilters: search.trim() !== "" || status !== null,
		setSearch,
		setStatus,
		setSort,
		sortBy,
		clearFilters,
	};
};
