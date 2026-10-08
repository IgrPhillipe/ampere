import { useDebouncedValue } from "@features/shared";
import {
	type ReviewQueueFilter,
	reviewQueueFilterSchema,
} from "@services/review-queue";
import {
	createParser,
	debounce,
	parseAsString,
	parseAsStringLiteral,
	useQueryState,
} from "nuqs";
import { useCallback } from "react";

export const REVIEW_QUEUE_SEARCH_DEBOUNCE_MS = 350;

export const positivePageParser = createParser({
	parse: (value) => {
		const page = Number(value);
		return Number.isInteger(page) && page >= 1 ? page : null;
	},
	serialize: String,
}).withDefault(1);

export const reviewQueueFilterParser = parseAsStringLiteral(
	reviewQueueFilterSchema.options,
).withDefault("ALL");

export const useReviewQueueFilters = () => {
	const [filter, setFilterQuery] = useQueryState(
		"filter",
		reviewQueueFilterParser,
	);
	const [search, setSearchQuery] = useQueryState(
		"search",
		parseAsString.withDefault("").withOptions({
			limitUrlUpdates: debounce(REVIEW_QUEUE_SEARCH_DEBOUNCE_MS),
		}),
	);
	const [page, setPageQuery] = useQueryState("page", positivePageParser);
	const debouncedSearch = useDebouncedValue(
		search.trim(),
		REVIEW_QUEUE_SEARCH_DEBOUNCE_MS,
	);

	const setFilter = useCallback(
		(nextFilter: ReviewQueueFilter) => {
			void setFilterQuery(nextFilter === "ALL" ? null : nextFilter);
			void setPageQuery(null);
		},
		[setFilterQuery, setPageQuery],
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
		void setFilterQuery(null);
		void setSearchQuery(null);
		void setPageQuery(null);
	}, [setFilterQuery, setSearchQuery, setPageQuery]);

	return {
		filter,
		search,
		debouncedSearch,
		page,
		hasActiveFilters: filter !== "ALL" || search.trim() !== "",
		setFilter,
		setSearch,
		setPage,
		clearFilters,
	};
};
