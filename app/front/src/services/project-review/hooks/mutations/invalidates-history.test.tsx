import { projectEventKeys } from "@services/project-events";
import {
	assignProjectReview,
	decideProjectReview,
	resolveFinding,
} from "@services/project-review/requests";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";

import { useAssignProjectReview } from "./useAssignProjectReview";
import { useDecideProjectReview } from "./useDecideProjectReview";
import { useResolveFinding } from "./useResolveFinding";

vi.mock("@services/project-review/requests", () => ({
	assignProjectReview: vi.fn(),
	decideProjectReview: vi.fn(),
	resolveFinding: vi.fn(),
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const historyKeys = [
	projectEventKeys.list("4", { direction: "DESC" }),
	projectEventKeys.rework("4"),
];

const setup = <T,>(useMutationHook: () => T) => {
	const queryClient = new QueryClient();
	for (const key of historyKeys) queryClient.setQueryData(key, { data: [] });

	const wrapper = ({ children }: PropsWithChildren) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);

	return {
		mutation: renderHook(useMutationHook, { wrapper }).result,
		invalidated: () =>
			historyKeys.map((key) => queryClient.getQueryState(key)?.isInvalidated),
	};
};

describe("project history freshness", () => {
	it("refreshes the history after a decision", async () => {
		vi.mocked(decideProjectReview).mockResolvedValue({} as never);
		const { mutation, invalidated } = setup(useDecideProjectReview);

		await act(() =>
			mutation.current.mutateAsync({
				projectId: "4",
				decision: "APPROVE",
				opinion: "Aprovado.",
			}),
		);

		expect(invalidated()).toEqual([true, true]);
	});

	it("refreshes the history after the analyst checks a finding", async () => {
		vi.mocked(resolveFinding).mockResolvedValue({} as never);
		const { mutation, invalidated } = setup(useResolveFinding);

		await act(() =>
			mutation.current.mutateAsync({
				projectId: "4",
				findingId: "10",
				resolution: "ACCEPT",
			}),
		);

		expect(invalidated()).toEqual([true, true]);
	});

	it("refreshes the history after the analyst takes the review", async () => {
		vi.mocked(assignProjectReview).mockResolvedValue({} as never);
		const { mutation, invalidated } = setup(useAssignProjectReview);

		await act(() => mutation.current.mutateAsync("4"));

		expect(invalidated()).toEqual([true, true]);
	});
});
