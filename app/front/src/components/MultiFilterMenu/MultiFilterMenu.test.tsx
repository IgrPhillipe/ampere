import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MultiFilterMenu } from "./MultiFilterMenu";

const options = [
	{ value: "PE", label: "Pernambuco" },
	{ value: "PB", label: "Paraíba" },
];

const renderMenu = (value: string[]) => {
	const onValueChange = vi.fn();
	render(
		<MultiFilterMenu
			label="UF"
			allLabel="Todas"
			options={options}
			value={value}
			onValueChange={onValueChange}
		/>,
	);

	return onValueChange;
};

describe("MultiFilterMenu", () => {
	it("summarizes the selection on the button", () => {
		renderMenu(["PE", "PB"]);

		expect(
			screen.getByRole("button", { name: "UF: 2 selecionados" }),
		).toBeInTheDocument();
	});

	it("adds and removes values", async () => {
		const onValueChange = renderMenu(["PE"]);

		fireEvent.click(screen.getByRole("button", { name: "UF: Pernambuco" }));
		fireEvent.click(
			await screen.findByRole("menuitemcheckbox", { name: "Paraíba" }),
		);
		expect(onValueChange).toHaveBeenLastCalledWith(["PE", "PB"]);

		fireEvent.click(
			screen.getByRole("menuitemcheckbox", { name: "Pernambuco" }),
		);
		expect(onValueChange).toHaveBeenLastCalledWith([]);
	});

	it("clears the selection", async () => {
		const onValueChange = renderMenu(["PE"]);

		fireEvent.click(screen.getByRole("button", { name: "UF: Pernambuco" }));
		fireEvent.click(await screen.findByRole("menuitem", { name: "Todas" }));

		expect(onValueChange).toHaveBeenCalledWith([]);
	});
});
