import {
	type SortDirection,
	sortDirectionSchema,
	useDebouncedValue,
} from "@features/shared";
import {
	type ReviewQueueFilter,
	reviewQueueFilterSchema,
} from "@services/review-queue";
import {
	debounce,
	parseAsInteger,
	parseAsString,
	parseAsStringLiteral,
	useQueryStates,
} from "nuqs";
import { useCallback } from "react";

const SEARCH_DEBOUNCE_MS = 350;

export const useReviewQueueFilters = () => {
	const [{ filter, search, page, sort }, setQuery] = useQueryStates({
		filter: parseAsStringLiteral(reviewQueueFilterSchema.options).withDefault(
			"ALL",
		),
		search: parseAsString
			.withDefault("")
			.withOptions({ limitUrlUpdates: debounce(SEARCH_DEBOUNCE_MS) }),
		page: parseAsInteger.withDefault(1),
		sort: parseAsStringLiteral(sortDirectionSchema.options).withDefault("ASC"),
	});
	const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);

	const setFilter = useCallback(
		(nextFilter: ReviewQueueFilter) => {
			void setQuery({
				filter: nextFilter === "ALL" ? null : nextFilter,
				page: null,
			});
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
		(nextSort: SortDirection) => {
			void setQuery({
				sort: nextSort === "ASC" ? null : nextSort,
				page: null,
			});
		},
		[setQuery],
	);

	const clearFilters = useCallback(() => {
		void setQuery({ filter: null, search: null, page: null });
	}, [setQuery]);

	return {
		filter,
		search,
		debouncedSearch,
		page,
		sort,
		hasActiveFilters: filter !== "ALL" || search.trim() !== "",
		setFilter,
		setSearch,
		setPage,
		setSort,
		clearFilters,
	};
};
