import {
	type ListSort,
	nextSort,
	type SortDirections,
	sortDirectionSchema,
	useDebouncedValue,
} from "@features/shared";
import { type BrazilianState, brazilianStateSchema } from "@services/locations";
import {
	type ListReviewQueueParams,
	type ReviewQueueFilter,
	type ReviewQueueSort,
	reviewQueueFilterSchema,
	reviewQueueSortSchema,
	UNASSIGNED_REVIEWER,
} from "@services/review-queue";
import {
	debounce,
	parseAsInteger,
	parseAsString,
	parseAsStringLiteral,
	useQueryStates,
} from "nuqs";
import { useCallback, useMemo } from "react";

const SEARCH_DEBOUNCE_MS = 350;

const DEFAULT_SORT: ReviewQueueSort = "deadline";

export const REVIEW_QUEUE_SORT_DIRECTIONS: SortDirections<ReviewQueueSort> = {
	deadline: "ASC",
	submittedAt: "ASC",
	demand: "DESC",
	warnings: "DESC",
};

export type ReviewQueueFilters = ReturnType<typeof useReviewQueueFilters>;

const toReviewer = (value: string | null) =>
	value === UNASSIGNED_REVIEWER || (value && /^\d+$/.test(value))
		? value
		: null;

export const useReviewQueueFilters = () => {
	const [query, setQuery] = useQueryStates({
		filter: parseAsStringLiteral(reviewQueueFilterSchema.options).withDefault(
			"ALL",
		),
		search: parseAsString
			.withDefault("")
			.withOptions({ limitUrlUpdates: debounce(SEARCH_DEBOUNCE_MS) }),
		page: parseAsInteger.withDefault(1),
		sort: parseAsStringLiteral(reviewQueueSortSchema.options).withDefault(
			DEFAULT_SORT,
		),
		direction: parseAsStringLiteral(sortDirectionSchema.options),
		reviewer: parseAsString,
		state: parseAsStringLiteral(brazilianStateSchema.options),
		municipality: parseAsString,
	});
	const { filter, search, page, state, municipality } = query;
	const reviewer = toReviewer(query.reviewer);
	const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);

	const sort = useMemo<ListSort<ReviewQueueSort>>(
		() => ({
			column: query.sort,
			direction: query.direction ?? REVIEW_QUEUE_SORT_DIRECTIONS[query.sort],
		}),
		[query.sort, query.direction],
	);

	const params = useMemo<Omit<ListReviewQueueParams, "pageSize">>(
		() => ({
			page,
			filter,
			search: debouncedSearch || undefined,
			sort: sort.column,
			direction: sort.direction,
			reviewer: reviewer ?? undefined,
			state: state ?? undefined,
			municipality: municipality ?? undefined,
		}),
		[page, filter, debouncedSearch, sort, reviewer, state, municipality],
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

	const setSort = useCallback(
		({ column, direction }: ListSort<ReviewQueueSort>) => {
			void setQuery({
				sort: column === DEFAULT_SORT ? null : column,
				direction:
					direction === REVIEW_QUEUE_SORT_DIRECTIONS[column] ? null : direction,
				page: null,
			});
		},
		[setQuery],
	);

	const sortBy = useCallback(
		(column: ReviewQueueSort) => {
			setSort(nextSort(sort, column, REVIEW_QUEUE_SORT_DIRECTIONS));
		},
		[sort, setSort],
	);

	const setReviewer = useCallback(
		(value: string | null) => {
			void setQuery({ reviewer: value, page: null });
		},
		[setQuery],
	);

	const setState = useCallback(
		(value: BrazilianState | null) => {
			void setQuery({ state: value, municipality: null, page: null });
		},
		[setQuery],
	);

	const setMunicipality = useCallback(
		(value: string | null) => {
			void setQuery({ municipality: value, page: null });
		},
		[setQuery],
	);

	const clearFilters = useCallback(() => {
		void setQuery({
			filter: null,
			search: null,
			reviewer: null,
			state: null,
			municipality: null,
			page: null,
		});
	}, [setQuery]);

	return {
		filter,
		search,
		page,
		sort,
		reviewer,
		state,
		municipality,
		params,
		hasActiveFilters:
			filter !== "ALL" ||
			search.trim() !== "" ||
			reviewer !== null ||
			state !== null ||
			municipality !== null,
		setFilter,
		setSearch,
		setPage,
		setSort,
		sortBy,
		setReviewer,
		setState,
		setMunicipality,
		clearFilters,
	};
};
