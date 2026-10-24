import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DateRangeFilter } from "./DateRangeFilter";

const renderRange = (from: string | null, to: string | null) => {
	const onValueChange = vi.fn();
	render(
		<DateRangeFilter
			label="Criado entre"
			value={{ from, to }}
			onValueChange={onValueChange}
		/>,
	);

	return onValueChange;
};

describe("DateRangeFilter", () => {
	it("drops the end when the new start passes it", () => {
		const onValueChange = renderRange(null, "2026-08-01");

		fireEvent.change(screen.getByLabelText("Data inicial"), {
			target: { value: "2026-08-15" },
		});

		expect(onValueChange).toHaveBeenCalledWith({
			from: "2026-08-15",
			to: null,
		});
	});

	it("drops the start when the new end comes before it", () => {
		const onValueChange = renderRange("2026-08-15", null);

		fireEvent.change(screen.getByLabelText("Data final"), {
			target: { value: "2026-08-01" },
		});

		expect(onValueChange).toHaveBeenCalledWith({
			from: null,
			to: "2026-08-01",
		});
	});

	it("keeps a valid period", () => {
		const onValueChange = renderRange("2026-08-01", null);

		fireEvent.change(screen.getByLabelText("Data final"), {
			target: { value: "2026-08-31" },
		});

		expect(onValueChange).toHaveBeenCalledWith({
			from: "2026-08-01",
			to: "2026-08-31",
		});
	});
});
