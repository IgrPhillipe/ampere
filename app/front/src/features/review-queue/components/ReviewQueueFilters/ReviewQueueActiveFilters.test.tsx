import { reviewQueueKeys } from "@services/review-queue";
import { getReviewerList } from "@services/review-queue/requests";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import type { PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useReviewQueueFilters } from "../../hooks";
import { ReviewQueueActiveFilters } from "./ReviewQueueActiveFilters";

vi.mock("@services/review-queue/requests", () => ({
	getReviewerList: vi.fn(),
}));

const Chips = () => (
	<ReviewQueueActiveFilters filters={useReviewQueueFilters()} />
);

const renderChips = (searchParams: string, cachedReviewers?: boolean) => {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});

	if (cachedReviewers) {
		queryClient.setQueryData(reviewQueueKeys.reviewers(), {
			data: [{ id: "3", name: "Revisor Teste" }],
		});
	}

	const NuqsAdapter = withNuqsTestingAdapter({ searchParams });
	const wrapper = ({ children }: PropsWithChildren) => (
		<QueryClientProvider client={queryClient}>
			<NuqsAdapter>{children}</NuqsAdapter>
		</QueryClientProvider>
	);

	render(<Chips />, { wrapper });
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
});
