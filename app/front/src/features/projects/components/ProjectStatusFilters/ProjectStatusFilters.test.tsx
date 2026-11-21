import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProjectStatusFilters } from "./ProjectStatusFilters";

const counts = {
	total: 7,
	draft: 1,
	awaitingSubmission: 1,
	underReview: 1,
	rejected: 1,
	approved: 1,
	expired: 2,
};

describe("ProjectStatusFilters", () => {
	it("shows the expired tile with its count", () => {
		render(
			<ProjectStatusFilters
				counts={counts}
				value={null}
				onValueChange={vi.fn()}
			/>,
		);

		expect(screen.getByRole("button", { name: /Expirado/ })).toHaveTextContent(
			"02",
		);
		expect(screen.getAllByRole("button")).toHaveLength(7);
	});
});
