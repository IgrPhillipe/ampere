import type { ReviewQueueItem } from "@services/review-queue";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AnalyzeButton } from "./AnalyzeButton";
import { ReviewQueueListing } from "./ReviewQueueListing";

const item: ReviewQueueItem = {
	id: "1",
	name: "Condomínio Vila Nova",
	protocol: "2026-0475",
	municipality: "Jaboatão dos Guararapes",
	state: "PE",
	submittedAt: "2026-09-08T12:00:00Z",
	deadline: "2026-10-08",
	deadlineStatus: "ON_TIME",
	daysRemaining: 20,
	warnings: 1,
	alerts: [
		"Recarga de 44,40 kW instalados, acima de 20 kW: exige estudo da rede.",
	],
	ownerName: "João Projetista",
	consumerUnitsCount: 48,
	demandKva: 229.4,
	reanalysis: false,
	reviewCycle: 1,
};

describe("ReviewQueueListing", () => {
	it("renders its loading state", () => {
		const { container } = render(
			<ReviewQueueListing items={[]} isLoading onAnalyze={vi.fn()} />,
		);

		expect(
			container.querySelectorAll('[data-slot="skeleton"]'),
		).not.toHaveLength(0);
	});

	it("renders an empty state with a filter reset", () => {
		const onClearFilters = vi.fn();
		render(
			<ReviewQueueListing
				items={[]}
				onAnalyze={vi.fn()}
				onClearFilters={onClearFilters}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Limpar Filtros" }));
		expect(onClearFilters).toHaveBeenCalledOnce();
	});

	it("splits the deadline date from the deadline status", () => {
		render(
			<ReviewQueueListing
				onAnalyze={vi.fn()}
				items={[
					{
						...item,
						deadlineStatus: "OVERDUE",
						daysRemaining: -3,
						reanalysis: true,
						reviewCycle: 2,
					},
				]}
			/>,
		);

		expect(screen.getAllByText("Atrasado")[0]).toHaveAttribute(
			"data-variant",
			"destructive",
		);
		expect(screen.getAllByText("3 dias de atraso")).not.toHaveLength(0);
		expect(screen.getAllByText("08/10/2026")).not.toHaveLength(0);
		expect(screen.getAllByText("2º envio")).not.toHaveLength(0);
		expect(
			screen.getAllByText(
				"Prazo vencido há 3 dias. Venceu em 08/10/2026. 1 alerta na pré-validação do cálculo. Priorize esta análise.",
			),
		).not.toHaveLength(0);
	});

	it("joins the municipality and the designer without a middle dot", () => {
		render(<ReviewQueueListing items={[item]} onAnalyze={vi.fn()} />);

		expect(
			screen.getAllByText("Jaboatão dos Guararapes/PE, João Projetista"),
		).not.toHaveLength(0);
	});
});

describe("AnalyzeButton", () => {
	it("opens the analysis of the row", () => {
		const onAnalyze = vi.fn();
		render(<AnalyzeButton urgent onAnalyze={onAnalyze} />);

		const button = screen.getByRole("button", { name: /analisar/i });
		fireEvent.click(button);

		expect(button).not.toHaveAttribute("aria-disabled");
		expect(onAnalyze).toHaveBeenCalledOnce();
	});

	it("hands the clicked item to the listing callback", () => {
		const onAnalyze = vi.fn();
		render(<ReviewQueueListing items={[item]} onAnalyze={onAnalyze} />);

		fireEvent.click(screen.getAllByRole("button", { name: /analisar/i })[0]);

		expect(onAnalyze).toHaveBeenCalledWith(item);
	});
});
