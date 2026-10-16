import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { projectKeys } from "../../../query-keys";
import { deleteProject } from "../../../requests";
import { useDeleteProject } from "./useDeleteProject";

vi.mock("../../../requests", () => ({ deleteProject: vi.fn() }));
vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}));

describe("useDeleteProject", () => {
	beforeEach(() => {
		vi.mocked(deleteProject).mockResolvedValue(undefined);
	});

	it("removes the detail and invalidates lists and counters", async () => {
		const queryClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false },
				mutations: { retry: false },
			},
		});
		const listKey = projectKeys.list({ page: 1 });
		const countsKey = projectKeys.statusCounts();
		const detailKey = projectKeys.detail("4");
		queryClient.setQueryData(listKey, { data: [] });
		queryClient.setQueryData(countsKey, { data: { draft: 1 } });
		queryClient.setQueryData(detailKey, { data: { id: "4" } });

		const wrapper = ({ children }: PropsWithChildren) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);
		const { result } = renderHook(() => useDeleteProject(), { wrapper });

		act(() => result.current.mutate("4"));
		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(deleteProject).toHaveBeenCalledWith("4", expect.anything());
		expect(queryClient.getQueryData(detailKey)).toBeUndefined();
		expect(queryClient.getQueryState(listKey)?.isInvalidated).toBe(true);
		expect(queryClient.getQueryState(countsKey)?.isInvalidated).toBe(true);
		expect(toast.success).toHaveBeenCalledWith("Projeto excluído.");
	});
});
