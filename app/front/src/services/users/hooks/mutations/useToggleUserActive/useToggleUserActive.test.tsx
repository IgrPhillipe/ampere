import { dashboardKeys } from "@services/dashboard/query-keys";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { userKeys } from "../../../query-keys";
import { updateUser } from "../../../requests";
import type { ManagedUser } from "../../../schemas";
import { useToggleUserActive } from "./useToggleUserActive";

vi.mock("../../../requests", () => ({ updateUser: vi.fn() }));
vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}));

const user: ManagedUser = {
	id: "7",
	name: "Ana Souza",
	email: "ana@example.com",
	role: "reviewer",
	active: true,
	mustChangePassword: false,
	lastLoginAt: null,
	createdAt: "2026-11-01T12:00:00Z",
};

const setup = () => {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	const wrapper = ({ children }: PropsWithChildren) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);

	return { queryClient, wrapper };
};

describe("useToggleUserActive", () => {
	beforeEach(() => vi.clearAllMocks());

	it("deactivates the user and refreshes the user list and the dashboard", async () => {
		vi.mocked(updateUser).mockResolvedValue({
			data: { ...user, active: false },
		});
		const { queryClient, wrapper } = setup();
		const listKey = userKeys.list({ page: 1 });
		const dashboardKey = dashboardKeys.admin();
		queryClient.setQueryData(listKey, { data: [] });
		queryClient.setQueryData(dashboardKey, { data: {} });

		const { result } = renderHook(() => useToggleUserActive(), { wrapper });
		act(() => result.current.mutate(user));
		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(updateUser).toHaveBeenCalledWith({
			id: "7",
			payload: { name: "Ana Souza", role: "reviewer", active: false },
		});
		expect(queryClient.getQueryState(listKey)?.isInvalidated).toBe(true);
		expect(queryClient.getQueryState(dashboardKey)?.isInvalidated).toBe(true);
		expect(toast.success).toHaveBeenCalledWith("Usuário desativado.");
	});

	it("keeps the dashboard when the API refuses", async () => {
		vi.mocked(updateUser).mockRejectedValue(new Error("boom"));
		const { queryClient, wrapper } = setup();
		const dashboardKey = dashboardKeys.admin();
		queryClient.setQueryData(dashboardKey, { data: {} });

		const { result } = renderHook(() => useToggleUserActive(), { wrapper });
		act(() => result.current.mutate(user));
		await waitFor(() => expect(result.current.isError).toBe(true));

		expect(queryClient.getQueryState(dashboardKey)?.isInvalidated).toBe(false);
		expect(toast.error).toHaveBeenCalled();
	});
});
