import { dashboardKeys } from "@services/dashboard/query-keys";
import {
	decideProjectReview,
	respondFinding,
} from "@services/project-review/requests";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";

import { useDecideProjectReview } from "./useDecideProjectReview";
import { useRespondFinding } from "./useRespondFinding";

vi.mock("@services/project-review/requests", () => ({
	decideProjectReview: vi.fn(),
	respondFinding: vi.fn(),
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const panelKeys = [
	dashboardKeys.admin(),
	dashboardKeys.designer("LAST_30_DAYS"),
];

const setup = <T,>(useMutationHook: () => T) => {
	const queryClient = new QueryClient();
	for (const key of panelKeys) queryClient.setQueryData(key, { data: {} });

	const wrapper = ({ children }: PropsWithChildren) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);

	return {
		mutation: renderHook(useMutationHook, { wrapper }).result,
		invalidated: () =>
			panelKeys.map((key) => queryClient.getQueryState(key)?.isInvalidated),
	};
};

describe("dashboard freshness after a review action", () => {
	it("refreshes the dashboards after a decision", async () => {
		vi.mocked(decideProjectReview).mockResolvedValue({} as never);
		const { mutation, invalidated } = setup(useDecideProjectReview);

		await act(() =>
			mutation.current.mutateAsync({
				projectId: "4",
				decision: "REJECT",
				opinion: "Reprovado.",
			}),
		);

		expect(invalidated()).toEqual([true, true]);
	});

	it("refreshes the dashboards after the designer answers a finding", async () => {
		vi.mocked(respondFinding).mockResolvedValue({} as never);
		const { mutation, invalidated } = setup(useRespondFinding);

		await act(() =>
			mutation.current.mutateAsync({
				projectId: "4",
				findingId: "10",
				status: "FIXED",
			}),
		);

		expect(invalidated()).toEqual([true, true]);
	});
});
