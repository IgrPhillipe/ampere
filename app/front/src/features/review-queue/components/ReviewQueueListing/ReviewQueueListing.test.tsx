import type { ReviewQueueItem } from "@services/review-queue";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AnalyzeButton } from "./AnalyzeButton";
import { DeadlineBadge } from "./ReviewQueueBadges";
import { ReviewQueueListing } from "./ReviewQueueListing";

const item: ReviewQueueItem = {
	id: "1",
	name: "Condomínio Vila Nova",
	protocol: "2026-0475",
	municipality: "Jaboatão dos Guararapes",
	submittedAt: "2026-09-08T12:00:00Z",
	deadline: "2026-10-08",
	deadlineStatus: "ON_TIME",
	daysRemaining: 20,
	warnings: 1,
	ownerName: "João Projetista",
	consumerUnitsCount: 48,
	demandKva: 229.4,
	reanalysis: false,
};

describe("ReviewQueueListing", () => {
	it("renders its loading state", () => {
		const { container } = render(<ReviewQueueListing items={[]} isLoading />);

		expect(
			container.querySelectorAll('[data-slot="skeleton"]'),
		).not.toHaveLength(0);
	});

	it("renders an empty state with a filter reset", () => {
		const onClearFilters = vi.fn();
		render(<ReviewQueueListing items={[]} onClearFilters={onClearFilters} />);

		fireEvent.click(screen.getByRole("button", { name: "Limpar Filtros" }));
		expect(onClearFilters).toHaveBeenCalledOnce();
	});

	it("flags overdue projects and shows the deadline as a badge", () => {
		render(
			<ReviewQueueListing
				items={[{ ...item, deadlineStatus: "OVERDUE", daysRemaining: -3 }]}
			/>,
		);

		const deadline = screen.getAllByText("Atrasado 3 Dias")[0];
		expect(deadline.closest('[data-slot="badge"]')).toBeInTheDocument();
		expect(screen.getAllByText("Análise atrasada")).not.toHaveLength(0);
	});

	it("joins the municipality and the designer without a middle dot", () => {
		render(<ReviewQueueListing items={[item]} />);

		expect(
			screen.getAllByText("Jaboatão dos Guararapes, João Projetista"),
		).not.toHaveLength(0);
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
		expect(button).toHaveAttribute(
			"title",
			"A análise individual estará disponível em uma próxima etapa.",
		);
	});
});

describe("DeadlineBadge", () => {
	it("uses the success style for projects within the deadline", () => {
		render(<DeadlineBadge deadlineStatus="ON_TIME" daysRemaining={20} />);

		expect(screen.getByText("20 Dias")).toHaveAttribute(
			"data-variant",
			"success",
		);
	});
});
