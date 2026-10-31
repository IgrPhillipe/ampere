import { useDebouncedValue } from "@features/shared";
import { userRoleSchema } from "@services/auth";
import type { ListUsersParams } from "@services/users";
import {
	debounce,
	parseAsInteger,
	parseAsString,
	parseAsStringLiteral,
	useQueryStates,
} from "nuqs";
import { useCallback, useMemo } from "react";

import { USER_STATUSES, type UserStatus } from "../../constants";

const SEARCH_DEBOUNCE_MS = 350;

export const USERS_PAGE_SIZE = 20;

export type UserFilters = ReturnType<typeof useUserFilters>;

export const useUserFilters = () => {
	const [query, setQuery] = useQueryStates({
		search: parseAsString
			.withDefault("")
			.withOptions({ limitUrlUpdates: debounce(SEARCH_DEBOUNCE_MS) }),
		role: parseAsStringLiteral(userRoleSchema.options),
		status: parseAsStringLiteral(USER_STATUSES),
		page: parseAsInteger.withDefault(1),
	});
	const { search, role, status, page } = query;
	const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);

	const params = useMemo<ListUsersParams>(
		() => ({
			search: debouncedSearch || undefined,
			role: role ?? undefined,
			active: status === null ? undefined : status === "active",
			page,
			pageSize: USERS_PAGE_SIZE,
		}),
		[debouncedSearch, role, status, page],
	);

	const setSearch = useCallback(
		(value: string) => {
			void setQuery({ search: value || null, page: null });
		},
		[setQuery],
	);

	const setRole = useCallback(
		(value: ListUsersParams["role"] | null) => {
			void setQuery({ role: value ?? null, page: null });
		},
		[setQuery],
	);

	const setStatus = useCallback(
		(value: UserStatus | null) => {
			void setQuery({ status: value, page: null });
		},
		[setQuery],
	);

	const setPage = useCallback(
		(value: number) => {
			void setQuery({ page: value });
		},
		[setQuery],
	);

	const clearFilters = useCallback(() => {
		void setQuery({ search: null, role: null, status: null, page: null });
	}, [setQuery]);

	return {
		search,
		role,
		status,
		page,
		params,
		hasActiveFilters: search.trim() !== "" || role !== null || status !== null,
		setSearch,
		setRole,
		setStatus,
		setPage,
		clearFilters,
	};
};
