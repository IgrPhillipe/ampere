import { makeReviewQueueItem } from "@services/review-queue/mocks/factories";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AnalyzeButton } from "./AnalyzeButton";
import { ReviewQueueListing } from "./ReviewQueueListing";

const defaultProps = {
	items: [],
	onRetry: vi.fn(),
	onPageChange: vi.fn(),
};

describe("ReviewQueueListing", () => {
	it("renders its loading state", () => {
		const { container } = render(
			<ReviewQueueListing {...defaultProps} isLoading />,
		);

		expect(
			container.querySelectorAll('[data-slot="skeleton"]'),
		).not.toHaveLength(0);
	});

	it("renders its error state and retries", () => {
		const onRetry = vi.fn();
		render(<ReviewQueueListing {...defaultProps} isError onRetry={onRetry} />);

		expect(
			screen.getByText("Não foi possível carregar a fila de análise"),
		).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
		expect(onRetry).toHaveBeenCalledOnce();
	});

	it("renders an empty state with a filter reset", () => {
		const onClearFilters = vi.fn();
		render(
			<ReviewQueueListing {...defaultProps} onClearFilters={onClearFilters} />,
		);

		fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
		expect(onClearFilters).toHaveBeenCalledOnce();
	});

	it("changes page using the shared pagination", () => {
		const onPageChange = vi.fn();
		render(
			<ReviewQueueListing
				{...defaultProps}
				items={[makeReviewQueueItem()]}
				pagination={{ page: 1, pageSize: 10, total: 12 }}
				onPageChange={onPageChange}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Próxima página" }));
		expect(onPageChange).toHaveBeenCalledWith(2);
	});

	it("renders deadline status as plain text", () => {
		render(
			<ReviewQueueListing
				{...defaultProps}
				items={[
					makeReviewQueueItem({
						deadlineStatus: "OVERDUE",
						daysRemaining: -3,
					}),
				]}
			/>,
		);

		const deadline = screen.getAllByText("Atrasado 3 dias")[0];
		expect(deadline.closest('[data-slot="badge"]')).toBeNull();
	});
});

describe("AnalyzeButton", () => {
	it("does not navigate and explains that the action is unavailable", () => {
		const initialUrl = window.location.href;
		render(<AnalyzeButton />);

		const button = screen.getByRole("button", { name: /analisar/i });
		fireEvent.click(button);

		expect(button).toHaveAttribute("aria-disabled", "true");
		expect(window.location.href).toBe(initialUrl);
		expect(screen.getByRole("tooltip")).toHaveTextContent(
			"A análise individual estará disponível em uma próxima etapa.",
		);
	});
});
