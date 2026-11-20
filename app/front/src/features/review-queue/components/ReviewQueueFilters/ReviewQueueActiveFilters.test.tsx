import { reviewQueueKeys } from "@services/review-queue";
import { getReviewerList } from "@services/review-queue/requests";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import type { PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { signInAs } from "@/test/fixtures/project-detail";

import { useReviewQueueFilters } from "../../hooks";
import { ReviewQueueActiveFilters } from "./ReviewQueueActiveFilters";

vi.mock("@services/review-queue/requests", () => ({
	getReviewerList: vi.fn(),
}));

const renderChips = (
	searchParams: string,
	cachedReviewers?: boolean,
	ownerName?: string,
) => {
	const Chips = () => (
		<ReviewQueueActiveFilters
			filters={useReviewQueueFilters()}
			ownerName={ownerName}
		/>
	);
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});

	if (cachedReviewers) {
		queryClient.setQueryData(reviewQueueKeys.reviewers(), {
			data: [
				{ id: "3", name: "Revisor Teste", role: "reviewer", active: true },
			],
		});
	}

	const onUrlUpdate = vi.fn();
	const NuqsAdapter = withNuqsTestingAdapter({
		searchParams,
		hasMemory: true,
		onUrlUpdate,
	});
	const wrapper = ({ children }: PropsWithChildren) => (
		<QueryClientProvider client={queryClient}>
			<NuqsAdapter>{children}</NuqsAdapter>
		</QueryClientProvider>
	);

	render(<Chips />, { wrapper });

	return () => onUrlUpdate.mock.lastCall?.[0]?.searchParams;
};

describe("ReviewQueueActiveFilters", () => {
	beforeEach(() => {
		signInAs("admin");
		vi.mocked(getReviewerList).mockReturnValue(new Promise(vi.fn()));
	});

	it("names the designer and clears the filter from the tag", async () => {
		const lastUrl = renderChips(
			"?owner=5&filter=DUE_SOON",
			false,
			"Beto Projetista",
		);

		expect(screen.getByText("Projetista: Beto Projetista")).toBeInTheDocument();

		fireEvent.click(
			screen.getByRole("button", {
				name: "Remover filtro Projetista: Beto Projetista",
			}),
		);

		await waitFor(() => expect(lastUrl()?.toString()).toBe("filter=DUE_SOON"));
	});

	it("shows no tag for an owner that is not an id", () => {
		renderChips("?owner=x y", false, "Beto Projetista");

		expect(screen.queryByText(/Projetista:/)).not.toBeInTheDocument();
	});
});
