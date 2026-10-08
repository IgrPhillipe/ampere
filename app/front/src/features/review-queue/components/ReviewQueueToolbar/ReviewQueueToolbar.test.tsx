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
				counts={counts}
				sort="DEADLINE_ASC"
				onSortChange={vi.fn()}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: /vencendo prazo/i }));

		expect(onFilterChange).toHaveBeenCalledWith("DUE_SOON");
	});

	it("toggles deadline sorting", () => {
		const onSortChange = vi.fn();
		render(
			<ReviewQueueToolbar
				search=""
				onSearchChange={vi.fn()}
				filter="ALL"
				onFilterChange={vi.fn()}
				counts={counts}
				sort="DEADLINE_ASC"
				onSortChange={onSortChange}
			/>,
		);

		fireEvent.click(
			screen.getByRole("button", { name: "Ordenar por prazo decrescente" }),
		);

		expect(onSortChange).toHaveBeenCalledWith("DEADLINE_DESC");
	});
});
