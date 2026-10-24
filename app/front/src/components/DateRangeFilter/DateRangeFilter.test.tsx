import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DateRangeFilter } from "./DateRangeFilter";

const renderRange = (from: string | null, to: string | null) => {
	const onValueChange = vi.fn();
	render(
		<DateRangeFilter
			label="Criado em"
			allLabel="Qualquer data"
			value={{ from, to }}
			onValueChange={onValueChange}
		/>,
	);

	return onValueChange;
};

const day = (name: RegExp) => screen.findByRole("button", { name });

describe("DateRangeFilter", () => {
	it("shows the period on the button", () => {
		renderRange("2026-08-01", "2026-08-31");

		expect(
			screen.getByRole("button", {
				name: "Criado em: 01/08/2026 a 31/08/2026",
			}),
		).toBeInTheDocument();
	});

	it("applies the period on the second day picked", async () => {
		const onValueChange = renderRange("2026-08-01", "2026-08-31");

		fireEvent.click(screen.getByRole("button", { name: /Criado em/ }));
		fireEvent.click(await day(/10 de agosto de 2026/));

		expect(onValueChange).not.toHaveBeenCalled();

		fireEvent.click(await day(/20 de agosto de 2026/));

		expect(onValueChange).toHaveBeenCalledWith({
			from: "2026-08-10",
			to: "2026-08-20",
		});
	});

	it("restarts the period when the second day comes first", async () => {
		const onValueChange = renderRange("2026-08-01", "2026-08-31");

		fireEvent.click(screen.getByRole("button", { name: /Criado em/ }));
		fireEvent.click(await day(/20 de agosto de 2026/));
		fireEvent.click(await day(/10 de agosto de 2026/));
		fireEvent.click(await day(/15 de agosto de 2026/));

		expect(onValueChange).toHaveBeenCalledOnce();
		expect(onValueChange).toHaveBeenCalledWith({
			from: "2026-08-10",
			to: "2026-08-15",
		});
	});

	it("clears the period", async () => {
		const onValueChange = renderRange("2026-08-01", "2026-08-31");

		fireEvent.click(screen.getByRole("button", { name: /Criado em/ }));
		fireEvent.click(
			await screen.findByRole("button", { name: "Limpar Período" }),
		);

		expect(onValueChange).toHaveBeenCalledWith({ from: null, to: null });
	});
});
