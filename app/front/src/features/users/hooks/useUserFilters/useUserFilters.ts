import { useDebouncedValue } from "@features/shared";
import { userRoleSchema } from "@services/auth";
import type { ListUsersParams } from "@services/users";
import {
	parseAsBoolean,
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
		search: parseAsString.withDefault(""),
		role: parseAsStringLiteral(userRoleSchema.options),
		status: parseAsStringLiteral(USER_STATUSES),
		mustChangePassword: parseAsBoolean,
		inactiveDays: parseAsInteger,
		page: parseAsInteger.withDefault(1),
	});
	const { search, role, status, page } = query;
	// Only the panel shortcuts set these; a hand-edited `false` or `0` lists everyone, as an unknown role does.
	const mustChangePassword = query.mustChangePassword === true ? true : null;
	const inactiveDays =
		query.inactiveDays !== null && query.inactiveDays >= 1
			? query.inactiveDays
			: null;
	// The URL follows each keystroke; only the request waits, so no update fires after leaving the list.
	const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);

	const params = useMemo<ListUsersParams>(
		() => ({
			search: debouncedSearch || undefined,
			role: role ?? undefined,
			active: status === null ? undefined : status === "active",
			mustChangePassword: mustChangePassword ?? undefined,
			inactiveDays: inactiveDays ?? undefined,
			page,
			pageSize: USERS_PAGE_SIZE,
		}),
		[debouncedSearch, role, status, mustChangePassword, inactiveDays, page],
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

	const setMustChangePassword = useCallback(
		(value: boolean | null) => {
			void setQuery({ mustChangePassword: value, page: null });
		},
		[setQuery],
	);

	const setInactiveDays = useCallback(
		(value: number | null) => {
			void setQuery({ inactiveDays: value, page: null });
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
		void setQuery({
			search: null,
			role: null,
			status: null,
			mustChangePassword: null,
			inactiveDays: null,
			page: null,
		});
	}, [setQuery]);

	return {
		search,
		role,
		status,
		mustChangePassword,
		inactiveDays,
		page,
		params,
		hasActiveFilters:
			search.trim() !== "" ||
			role !== null ||
			status !== null ||
			mustChangePassword !== null ||
			inactiveDays !== null,
		setSearch,
		setRole,
		setStatus,
		setMustChangePassword,
		setInactiveDays,
		setPage,
		clearFilters,
	};
};
