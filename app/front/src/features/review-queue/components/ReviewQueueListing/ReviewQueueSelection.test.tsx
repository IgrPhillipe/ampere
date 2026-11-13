import type { ReviewQueueItem } from "@services/review-queue";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ReviewQueueListing } from "./ReviewQueueListing";

const itemOf = (
	id: string,
	overrides: Partial<ReviewQueueItem> = {},
): ReviewQueueItem => ({
	id,
	name: `Projeto ${id}`,
	protocol: `2026-000${id}`,
	municipality: "Caruaru",
	state: "PE",
	submittedAt: "2026-09-08T12:00:00Z",
	deadline: "2026-10-08",
	deadlineStatus: "ON_TIME",
	daysRemaining: 20,
	warnings: 0,
	alerts: [],
	ownerName: "João Projetista",
	consumerUnitsCount: 4,
	demandKva: 30,
	reanalysis: false,
	reviewCycle: 1,
	reviewerId: null,
	reviewerName: null,
	...overrides,
});

const rowOf = (protocol: string) => {
	const row = screen.getByText(protocol).closest("tr");
	if (!row) throw new Error(`No row for ${protocol}`);
	return within(row);
};

describe("ReviewQueueListing responsible analyst", () => {
	const items = [
		itemOf("1"),
		itemOf("2", { reviewerId: "7", reviewerName: "Ana Analista" }),
		itemOf("3", { reviewerId: "8", reviewerName: "Bruno Analista" }),
	];

	it("names the responsible analyst, or says nobody holds it", () => {
		render(
			<ReviewQueueListing
				items={items}
				currentUserId="7"
				onAnalyze={vi.fn()}
			/>,
		);

		expect(
			screen.getByRole("columnheader", { name: "Analista Responsável" }),
		).toBeInTheDocument();
		expect(rowOf("2026-0001").getByText("Não Atribuído")).toBeInTheDocument();
		expect(rowOf("2026-0002").getByText("Ana Analista")).toBeInTheDocument();
	});

	it("offers Analisar only to the responsible analyst", () => {
		const onAnalyze = vi.fn();
		render(
			<ReviewQueueListing
				items={items}
				currentUserId="7"
				onAnalyze={onAnalyze}
			/>,
		);

		expect(
			rowOf("2026-0002").getByRole("button", { name: "Analisar" }),
		).toBeInTheDocument();
		expect(
			rowOf("2026-0001").getByRole("button", { name: "Consultar" }),
		).toBeInTheDocument();
		fireEvent.click(
			rowOf("2026-0003").getByRole("button", { name: "Consultar" }),
		);
		expect(onAnalyze).toHaveBeenCalledWith(items[2]);
	});
});

describe("ReviewQueueListing batch selection", () => {
	const items = [itemOf("1"), itemOf("2"), itemOf("3")];

	it("has no checkboxes without a selection", () => {
		render(<ReviewQueueListing items={items} onAnalyze={vi.fn()} />);

		expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
	});

	it("adds and removes a single row", () => {
		const onSelectedIdsChange = vi.fn();
		const { rerender } = render(
			<ReviewQueueListing
				items={items}
				onAnalyze={vi.fn()}
				selection={{ selectedIds: [], onSelectedIdsChange }}
			/>,
		);

		fireEvent.click(
			screen.getByRole("checkbox", { name: "Selecionar o projeto 2026-0002" }),
		);
		expect(onSelectedIdsChange).toHaveBeenLastCalledWith(["2"]);

		rerender(
			<ReviewQueueListing
				items={items}
				onAnalyze={vi.fn()}
				selection={{ selectedIds: ["1", "2"], onSelectedIdsChange }}
			/>,
		);
		fireEvent.click(
			screen.getByRole("checkbox", { name: "Selecionar o projeto 2026-0001" }),
		);
		expect(onSelectedIdsChange).toHaveBeenLastCalledWith(["2"]);
	});

	it("keeps the checkbox and its focus when the selection changes", () => {
		const onAnalyze = vi.fn();
		const onSelectedIdsChange = vi.fn();
		const { rerender } = render(
			<ReviewQueueListing
				items={items}
				onAnalyze={onAnalyze}
				selection={{ selectedIds: [], onSelectedIdsChange }}
			/>,
		);
		const checkbox = screen.getByRole("checkbox", {
			name: "Selecionar o projeto 2026-0002",
		});
		const analyze = rowOf("2026-0002").getByRole("button", {
			name: "Consultar",
		});
		checkbox.focus();
		fireEvent.click(checkbox);

		// The page hands a new selection object on every change.
		rerender(
			<ReviewQueueListing
				items={items}
				onAnalyze={onAnalyze}
				selection={{ selectedIds: ["2"], onSelectedIdsChange }}
			/>,
		);

		expect(
			screen.getByRole("checkbox", { name: "Selecionar o projeto 2026-0002" }),
		).toBe(checkbox);
		expect(checkbox).toHaveAttribute("aria-checked", "true");
		expect(checkbox).toHaveFocus();
		expect(rowOf("2026-0002").getByRole("button", { name: "Consultar" })).toBe(
			analyze,
		);
	});

	it("selects the whole page from the header and clears it again", () => {
		const onSelectedIdsChange = vi.fn();
		const { rerender } = render(
			<ReviewQueueListing
				items={items}
				onAnalyze={vi.fn()}
				selection={{ selectedIds: ["2"], onSelectedIdsChange }}
			/>,
		);
		const selectAll = () =>
			screen.getByRole("checkbox", {
				name: "Selecionar todos os projetos da página",
			});

		expect(selectAll()).toHaveAttribute("aria-checked", "mixed");
		fireEvent.click(selectAll());
		expect(onSelectedIdsChange).toHaveBeenLastCalledWith(["2", "1", "3"]);

		rerender(
			<ReviewQueueListing
				items={items}
				onAnalyze={vi.fn()}
				selection={{ selectedIds: ["1", "2", "3"], onSelectedIdsChange }}
			/>,
		);
		expect(selectAll()).toHaveAttribute("aria-checked", "true");
		fireEvent.click(selectAll());
		expect(onSelectedIdsChange).toHaveBeenLastCalledWith([]);
	});
});
