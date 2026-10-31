import {
	assignProjectReview,
	resolveFinding,
} from "@services/project-review/requests";
import { projectKeys } from "@services/projects";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";

import { useAssignProjectReview } from "./useAssignProjectReview";
import { useResolveFinding } from "./useResolveFinding";

vi.mock("@services/project-review/requests", () => ({
	assignProjectReview: vi.fn(),
	resolveFinding: vi.fn(),
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const summaryKey = projectKeys.detail("4");

const setup = <T,>(useMutationHook: () => T) => {
	const queryClient = new QueryClient();
	queryClient.setQueryData(summaryKey, { id: "4" });

	const wrapper = ({ children }: PropsWithChildren) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);

	return {
		mutation: renderHook(useMutationHook, { wrapper }).result,
		invalidated: () => queryClient.getQueryState(summaryKey)?.isInvalidated,
	};
};

describe("project summary freshness", () => {
	it("refreshes the project summary after the analyst checks a finding", async () => {
		vi.mocked(resolveFinding).mockResolvedValue({} as never);
		const { mutation, invalidated } = setup(useResolveFinding);

		await act(() =>
			mutation.current.mutateAsync({
				projectId: "4",
				findingId: "10",
				resolution: "ACCEPT",
			}),
		);

		expect(invalidated()).toBe(true);
	});

	it("refreshes the project summary after the analyst takes the review", async () => {
		vi.mocked(assignProjectReview).mockResolvedValue({} as never);
		const { mutation, invalidated } = setup(useAssignProjectReview);

		await act(() => mutation.current.mutateAsync("4"));

		expect(invalidated()).toBe(true);
	});
});
