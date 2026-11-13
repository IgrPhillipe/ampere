import { projectKeys } from "@services/projects";
import { reviewQueueKeys } from "@services/review-queue";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { httpErrorOf } from "@/test/fixtures/http-error";

import { reviewerDistributionKeys } from "../../query-keys";
import {
	assignReviewQueue,
	updateReviewerMunicipalities,
} from "../../requests";
import { useAssignReviewQueue } from "./useAssignReviewQueue";
import { useUpdateReviewerMunicipalities } from "./useUpdateReviewerMunicipalities";

vi.mock("../../requests", () => ({
	assignReviewQueue: vi.fn(),
	updateReviewerMunicipalities: vi.fn(),
}));
vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}));

const setup = () => {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	const wrapper = ({ children }: PropsWithChildren) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);

	return { queryClient, wrapper };
};

describe("useAssignReviewQueue", () => {
	beforeEach(() => vi.clearAllMocks());

	it("refreshes the queue and the assigned projects", async () => {
		vi.mocked(assignReviewQueue).mockResolvedValue(undefined);
		const { queryClient, wrapper } = setup();
		const queueKey = reviewQueueKeys.list({ page: 1 });
		const detailKey = projectKeys.detail("12");
		const otherKey = projectKeys.detail("99");
		queryClient.setQueryData(queueKey, { data: [] });
		queryClient.setQueryData(detailKey, { data: { id: "12" } });
		queryClient.setQueryData(otherKey, { data: { id: "99" } });

		const { result } = renderHook(() => useAssignReviewQueue(), { wrapper });
		act(() =>
			result.current.mutate({ projectIds: ["12", "15"], reviewerId: "7" }),
		);
		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(assignReviewQueue).toHaveBeenCalledWith(
			{ projectIds: ["12", "15"], reviewerId: "7" },
			expect.anything(),
		);
		expect(queryClient.getQueryState(queueKey)?.isInvalidated).toBe(true);
		expect(queryClient.getQueryState(detailKey)?.isInvalidated).toBe(true);
		expect(queryClient.getQueryState(otherKey)?.isInvalidated).toBe(false);
		expect(toast.success).toHaveBeenCalledWith("2 projetos atribuídos.");
	});

	it("shows the refusal of an inactive analyst", async () => {
		vi.mocked(assignReviewQueue).mockRejectedValue(
			await httpErrorOf(422, { status: 422, detail: "Analista inativo." }),
		);
		const { queryClient, wrapper } = setup();
		queryClient.setQueryData(reviewQueueKeys.reviewers(), { data: [] });

		const { result } = renderHook(() => useAssignReviewQueue(), { wrapper });
		act(() =>
			result.current.mutate({ projectIds: ["12", "15"], reviewerId: "9" }),
		);
		await waitFor(() => expect(result.current.isError).toBe(true));

		expect(toast.error).toHaveBeenCalledWith("Analista inativo.");
		expect(toast.success).not.toHaveBeenCalled();
		// Refetched, so the inactive analyst leaves the list of choices.
		expect(
			queryClient.getQueryState(reviewQueueKeys.reviewers())?.isInvalidated,
		).toBe(true);
	});

	it("keeps the lists when the API fails for another reason", async () => {
		vi.mocked(assignReviewQueue).mockRejectedValue(
			await httpErrorOf(500, { status: 500 }),
		);
		const { queryClient, wrapper } = setup();
		const queueKey = reviewQueueKeys.list({ page: 1 });
		queryClient.setQueryData(queueKey, { data: [] });

		const { result } = renderHook(() => useAssignReviewQueue(), { wrapper });
		act(() => result.current.mutate({ projectIds: ["12"], reviewerId: "7" }));
		await waitFor(() => expect(result.current.isError).toBe(true));

		expect(queryClient.getQueryState(queueKey)?.isInvalidated).toBe(false);
	});

	it("falls back to a generic message when the API says nothing useful", async () => {
		vi.mocked(assignReviewQueue).mockRejectedValue(
			await httpErrorOf(409, { status: 409 }),
		);
		const { wrapper } = setup();

		const { result } = renderHook(() => useAssignReviewQueue(), { wrapper });
		act(() => result.current.mutate({ projectIds: ["12"], reviewerId: "7" }));
		await waitFor(() => expect(result.current.isError).toBe(true));

		expect(toast.error).toHaveBeenCalledWith(
			"Não foi possível atribuir os projetos.",
		);
	});
});

describe("useUpdateReviewerMunicipalities", () => {
	beforeEach(() => vi.clearAllMocks());

	it("refreshes the distribution after saving", async () => {
		vi.mocked(updateReviewerMunicipalities).mockResolvedValue({
			data: [{ state: "PE", municipality: "Recife" }],
		});
		const { queryClient, wrapper } = setup();
		const listKey = reviewerDistributionKeys.list();
		queryClient.setQueryData(listKey, { data: [] });

		const { result } = renderHook(() => useUpdateReviewerMunicipalities(), {
			wrapper,
		});
		act(() =>
			result.current.mutate({
				reviewerId: "8",
				municipalities: [{ state: "PE", municipality: "Recife" }],
			}),
		);
		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(queryClient.getQueryState(listKey)?.isInvalidated).toBe(true);
		expect(toast.success).toHaveBeenCalledWith(
			"Municípios do analista atualizados.",
		);
	});

	it("names the analyst who already holds the municipality", async () => {
		const detail = "O município Caruaru já pertence ao analista Ana Analista.";
		vi.mocked(updateReviewerMunicipalities).mockRejectedValue(
			await httpErrorOf(409, { status: 409, detail }),
		);
		const { queryClient, wrapper } = setup();
		const listKey = reviewerDistributionKeys.list();
		queryClient.setQueryData(listKey, { data: [] });

		const { result } = renderHook(() => useUpdateReviewerMunicipalities(), {
			wrapper,
		});
		act(() =>
			result.current.mutate({
				reviewerId: "8",
				municipalities: [{ state: "PE", municipality: "Caruaru" }],
			}),
		);
		await waitFor(() => expect(result.current.isError).toBe(true));

		expect(toast.error).toHaveBeenCalledWith(detail);
		// Refetched, so the picker shows who holds it now.
		expect(queryClient.getQueryState(listKey)?.isInvalidated).toBe(true);
	});
});
