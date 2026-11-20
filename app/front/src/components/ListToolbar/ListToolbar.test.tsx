import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ListToolbar } from "./ListToolbar";

const renderToolbar = (props: Partial<Parameters<typeof ListToolbar>[0]>) =>
	render(
		<ListToolbar
			filters={null}
			search={<input aria-label="Buscar" />}
			refinements={<button type="button">UF</button>}
			{...props}
		/>,
	);

describe("ListToolbar", () => {
	it("places the actions beside the sort, apart from the refinements", () => {
		renderToolbar({
			sort: <button type="button">Ordenar</button>,
			actions: <button type="button">Exportar CSV</button>,
		});

		const sort = screen.getByRole("button", { name: "Ordenar" });
		const action = screen.getByRole("button", { name: "Exportar CSV" });
		const refinement = screen.getByRole("button", { name: "UF" });
		expect(action.parentElement).toBe(sort.parentElement);
		expect(refinement.parentElement).not.toBe(action.parentElement);
		expect(
			sort.compareDocumentPosition(action) & Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();
	});

	it("keeps the actions without a sort", () => {
		renderToolbar({ actions: <button type="button">Exportar CSV</button> });

		expect(
			screen.getByRole("button", { name: "Exportar CSV" }),
		).toBeInTheDocument();
	});

	it("leaves the sort alone when there are no actions", () => {
		renderToolbar({ sort: <button type="button">Ordenar</button> });

		const sort = screen.getByRole("button", { name: "Ordenar" });
		expect(sort.parentElement?.children).toHaveLength(1);
		expect(
			screen.queryByRole("button", { name: "Exportar CSV" }),
		).not.toBeInTheDocument();
	});
});
