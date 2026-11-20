import type { DateRange } from "@components/DateRangeFilter";
import { useDebouncedValue } from "@features/shared";
import dayjs from "@lib/dayjs";
import {
	CONCESSION_STATES,
	type ConcessionState,
	concessionMunicipalityOf,
} from "@services/locations";
import {
	type ListMyReviewsParams,
	type MyReviewFilter,
	myReviewFilterSchema,
} from "@services/review-queue";
import {
	parseAsInteger,
	parseAsNativeArrayOf,
	parseAsString,
	parseAsStringLiteral,
	useQueryStates,
} from "nuqs";
import { useCallback, useMemo } from "react";

const SEARCH_DEBOUNCE_MS = 350;

const toIsoDate = (value: string | null) =>
	value && dayjs(value, "YYYY-MM-DD", true).isValid() ? value : null;

export type MyReviewsFilters = ReturnType<typeof useMyReviewsFilters>;

/** The filters of "Meus Pareceres" live in the URL, like the queue's. */
export const useMyReviewsFilters = () => {
	const [query, setQuery] = useQueryStates({
		decision: parseAsStringLiteral(myReviewFilterSchema.options).withDefault(
			"ALL",
		),
		search: parseAsString.withDefault(""),
		page: parseAsInteger.withDefault(1),
		state: parseAsNativeArrayOf(parseAsStringLiteral(CONCESSION_STATES)),
		municipality: parseAsNativeArrayOf(parseAsString),
		decidedFrom: parseAsString,
		decidedTo: parseAsString,
	});
	const { decision, search, page, state, municipality } = query;
	const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);

	const period = useMemo<DateRange>(() => {
		const from = toIsoDate(query.decidedFrom);
		const to = toIsoDate(query.decidedTo);

		// An inverted period from a hand-edited URL would come back as a 400; the start wins.
		return { from, to: from && to && to < from ? null : to };
	}, [query.decidedFrom, query.decidedTo]);

	const params = useMemo<Omit<ListMyReviewsParams, "pageSize">>(
		() => ({
			page,
			decision: decision === "ALL" ? undefined : decision,
			search: debouncedSearch || undefined,
			state: state.length ? state : undefined,
			municipality: municipality.length ? municipality : undefined,
			decidedFrom: period.from ?? undefined,
			decidedTo: period.to ?? undefined,
		}),
		[page, decision, debouncedSearch, state, municipality, period],
	);

	const setDecision = useCallback(
		(value: MyReviewFilter) => {
			void setQuery({ decision: value === "ALL" ? null : value, page: null });
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
		(value: number) => {
			void setQuery({ page: value });
		},
		[setQuery],
	);

	// Municipalities of the states still chosen stay; the others go with their state.
	const setState = useCallback(
		(value: ConcessionState[]) => {
			void setQuery((current) => {
				const kept = value.length
					? current.municipality.filter((name) =>
							value.some((uf) => concessionMunicipalityOf(uf, name)),
						)
					: current.municipality;

				return {
					state: value.length ? value : null,
					municipality: kept.length ? kept : null,
					page: null,
				};
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
				decidedFrom: toIsoDate(from),
				decidedTo: toIsoDate(to),
				page: null,
			});
		},
		[setQuery],
	);

	const clearFilters = useCallback(() => {
		void setQuery({
			decision: null,
			search: null,
			state: null,
			municipality: null,
			decidedFrom: null,
			decidedTo: null,
			page: null,
		});
	}, [setQuery]);

	return {
		decision,
		search,
		page,
		state,
		municipality,
		period,
		params,
		hasActiveFilters:
			decision !== "ALL" ||
			search.trim() !== "" ||
			state.length > 0 ||
			municipality.length > 0 ||
			period.from !== null ||
			period.to !== null,
		setDecision,
		setSearch,
		setPage,
		setState,
		setMunicipality,
		setPeriod,
		clearFilters,
	};
};
