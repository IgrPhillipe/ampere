import { reviewQueueKeys } from "@services/review-queue";
import { getReviewerList } from "@services/review-queue/requests";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import type { PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

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
			data: [{ id: "3", name: "Revisor Teste" }],
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
		vi.mocked(getReviewerList).mockReturnValue(new Promise(vi.fn()));
	});

	it("names the analyst once the list is loaded", () => {
		renderChips("?reviewer=3&filter=DUE_SOON", true);

		expect(screen.getByText("Analista: Revisor Teste")).toBeInTheDocument();
		expect(screen.getByText("Vencendo o prazo")).toBeInTheDocument();
	});

	it("waits for the list instead of showing the analyst id", () => {
		renderChips("?reviewer=3");

		expect(screen.queryByText(/Analista/)).not.toBeInTheDocument();
	});

	it("labels the unassigned filter without the list", () => {
		renderChips("?reviewer=none");

		expect(screen.getByText("Sem analista")).toBeInTheDocument();
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
