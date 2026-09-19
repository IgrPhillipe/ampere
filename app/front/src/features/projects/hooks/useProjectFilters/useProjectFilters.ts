import type { ProjectStatus } from "@services/projects";
import {
	debounce,
	parseAsInteger,
	parseAsString,
	parseAsStringLiteral,
	useQueryState,
} from "nuqs";

import type { ProjectStatusFilter } from "../../types";
import { useDebouncedValue } from "../useDebouncedValue";

const projectStatuses = [
	"DRAFT",
	"AWAITING_SUBMISSION",
	"UNDER_REVIEW",
	"REJECTED",
	"APPROVED",
] as const satisfies readonly ProjectStatus[];

const SEARCH_DEBOUNCE_MS = 350;

export const useProjectFilters = () => {
	const [statusQuery, setStatusQuery] = useQueryState(
		"status",
		parseAsStringLiteral(projectStatuses),
	);
	const [search, setSearchQuery] = useQueryState(
		"search",
		parseAsString
			.withDefault("")
			.withOptions({ limitUrlUpdates: debounce(SEARCH_DEBOUNCE_MS) }),
	);
	const [page, setPageQuery] = useQueryState(
		"page",
		parseAsInteger.withDefault(1),
	);
	const status: ProjectStatusFilter = statusQuery ?? "ALL";
	const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);

	const setStatus = (status: ProjectStatusFilter) =>
		Promise.all([
			setStatusQuery(status === "ALL" ? null : status),
			setPageQuery(null),
		]);

	const setSearch = (value: string) =>
		Promise.all([setSearchQuery(value || null), setPageQuery(null)]);

	const setPage = (nextPage: number) => setPageQuery(nextPage);

	return {
		status,
		search,
		debouncedSearch,
		page,
		setStatus,
		setSearch,
		setPage,
	};
};
