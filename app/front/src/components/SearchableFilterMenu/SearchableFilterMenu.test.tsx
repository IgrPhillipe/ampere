import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SearchableFilterMenu } from "./SearchableFilterMenu";

const renderMenu = (value: string[]) => {
	const onValueChange = vi.fn();
	render(
		<SearchableFilterMenu
			label="Município"
			allLabel="Todos"
			searchPlaceholder="Buscar município"
			emptyMessage="Nenhum município encontrado."
			options={[
				"Jaboatão dos Guararapes",
				"Olinda",
				"Pedras de Fogo",
				"Recife",
			]}
			value={value}
			onValueChange={onValueChange}
		/>,
	);

	return onValueChange;
};

describe("SearchableFilterMenu", () => {
	it("narrows the options by the search and adds the picked one", async () => {
		const onValueChange = renderMenu(["Recife"]);

		fireEvent.click(
			screen.getByRole("combobox", { name: "Município: Recife" }),
		);
		fireEvent.change(await screen.findByPlaceholderText("Buscar município"), {
			target: { value: "olin" },
		});

		expect(screen.queryByRole("option", { name: "Pedras de Fogo" })).toBeNull();

		fireEvent.click(screen.getByRole("option", { name: "Olinda" }));

		expect(onValueChange).toHaveBeenLastCalledWith(["Recife", "Olinda"]);
	});

	it("finds a name without typing its accents", async () => {
		renderMenu([]);

		fireEvent.click(screen.getByRole("combobox", { name: "Município: Todos" }));
		fireEvent.change(await screen.findByPlaceholderText("Buscar município"), {
			target: { value: "jaboatao" },
		});

		expect(
			screen.getByRole("option", { name: "Jaboatão dos Guararapes" }),
		).toBeInTheDocument();
		expect(screen.queryByRole("option", { name: "Olinda" })).toBeNull();
	});

	it("tells when nothing matches", async () => {
		renderMenu([]);

		fireEvent.click(screen.getByRole("combobox", { name: "Município: Todos" }));
		fireEvent.change(await screen.findByPlaceholderText("Buscar município"), {
			target: { value: "xyz" },
		});

		expect(
			await screen.findByText("Nenhum município encontrado."),
		).toBeInTheDocument();
	});
});
