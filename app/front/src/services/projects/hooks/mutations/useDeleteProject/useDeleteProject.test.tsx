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

	it("lets the caller leave before the detail is removed", async () => {
		const queryClient = new QueryClient();
		const detailKey = projectKeys.detail("4");
		queryClient.setQueryData(detailKey, { data: { id: "4" } });
		let detailWhenLeaving: unknown;
		const onDeleted = vi.fn(() => {
			detailWhenLeaving = queryClient.getQueryData(detailKey);
		});

		const wrapper = ({ children }: PropsWithChildren) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);
		const { result } = renderHook(() => useDeleteProject({ onDeleted }), {
			wrapper,
		});

		act(() => result.current.mutate("4"));
		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(onDeleted).toHaveBeenCalledOnce();
		expect(detailWhenLeaving).toEqual({ data: { id: "4" } });
		expect(queryClient.getQueryData(detailKey)).toBeUndefined();
	});

	it("keeps the caller and the detail in place when the deletion fails", async () => {
		vi.mocked(deleteProject).mockRejectedValue(
			new Error("Só é possível excluir um projeto em rascunho."),
		);
		const queryClient = new QueryClient({
			defaultOptions: { mutations: { retry: false } },
		});
		const detailKey = projectKeys.detail("4");
		queryClient.setQueryData(detailKey, { data: { id: "4" } });
		const onDeleted = vi.fn();

		const wrapper = ({ children }: PropsWithChildren) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);
		const { result } = renderHook(() => useDeleteProject({ onDeleted }), {
			wrapper,
		});

		act(() => result.current.mutate("4"));
		await waitFor(() => expect(result.current.isError).toBe(true));

		expect(onDeleted).not.toHaveBeenCalled();
		expect(queryClient.getQueryData(detailKey)).toEqual({ data: { id: "4" } });
		expect(toast.error).toHaveBeenCalledWith(
			"Só é possível excluir um projeto em rascunho.",
		);
	});
});
