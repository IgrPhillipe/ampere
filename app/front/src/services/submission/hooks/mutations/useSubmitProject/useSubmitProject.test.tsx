import { dashboardKeys } from "@services/dashboard/query-keys";
import { projectKeys } from "@services/projects";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";

import { submitProject } from "../../../requests";
import { useSubmitProject } from "./useSubmitProject";

vi.mock("../../../requests", () => ({ submitProject: vi.fn() }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe("useSubmitProject", () => {
	it("refreshes the project lists and the designer dashboard", async () => {
		vi.mocked(submitProject).mockResolvedValue({ data: { id: "4" } } as never);
		const queryClient = new QueryClient();
		const listKey = projectKeys.list({ page: 1 });
		const dashboardKey = dashboardKeys.designer("LAST_30_DAYS");
		queryClient.setQueryData(listKey, { data: [] });
		queryClient.setQueryData(dashboardKey, { data: {} });

		const wrapper = ({ children }: PropsWithChildren) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);
		const { result } = renderHook(() => useSubmitProject(), { wrapper });

		await act(() => result.current.mutateAsync({ projectId: "4" }));

		expect(queryClient.getQueryState(listKey)?.isInvalidated).toBe(true);
		expect(queryClient.getQueryState(dashboardKey)?.isInvalidated).toBe(true);
		expect(toast.success).toHaveBeenCalledWith("Projeto enviado para análise.");
	});
});
