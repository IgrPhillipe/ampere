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
	useQueryStates,
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
	const [{ filter, search, page }, setQuery] = useQueryStates({
		filter: reviewQueueFilterParser,
		search: parseAsString.withDefault("").withOptions({
			limitUrlUpdates: debounce(REVIEW_QUEUE_SEARCH_DEBOUNCE_MS),
		}),
		page: positivePageParser,
	});
	const debouncedSearch = useDebouncedValue(
		search.trim(),
		REVIEW_QUEUE_SEARCH_DEBOUNCE_MS,
	);

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

	const clearFilters = useCallback(() => {
		void setQuery({ filter: null, search: null, page: null });
	}, [setQuery]);

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
