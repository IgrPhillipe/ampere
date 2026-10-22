import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ReviewQueueToolbar } from "./ReviewQueueToolbar";

const counts = {
	total: 3,
	dueSoon: 2,
	highDemand: 1,
	reanalysis: 1,
	reviewedToday: 2,
	monthlyRejectionPercent: 50,
};

describe("ReviewQueueToolbar", () => {
	it("changes the queue filter", () => {
		const onFilterChange = vi.fn();
		render(
			<ReviewQueueToolbar
				search=""
				onSearchChange={vi.fn()}
				filter="ALL"
				onFilterChange={onFilterChange}
				indicators={counts}
				sort={{ column: "deadline", direction: "ASC" }}
				onSortChange={vi.fn()}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: /vencendo o prazo/i }));

		expect(onFilterChange).toHaveBeenCalledWith("DUE_SOON");
	});

	it("sorts by another column in its natural direction", async () => {
		const onSortChange = vi.fn();
		render(
			<ReviewQueueToolbar
				search=""
				onSearchChange={vi.fn()}
				filter="ALL"
				onFilterChange={vi.fn()}
				indicators={counts}
				sort={{ column: "deadline", direction: "ASC" }}
				onSortChange={onSortChange}
			/>,
		);

		fireEvent.click(
			screen.getByRole("button", { name: "Ordenar por vencimento, crescente" }),
		);
		fireEvent.click(
			await screen.findByRole("menuitemradio", { name: "Demanda" }),
		);

		expect(onSortChange).toHaveBeenCalledWith({
			column: "demand",
			direction: "DESC",
		});
	});
});
