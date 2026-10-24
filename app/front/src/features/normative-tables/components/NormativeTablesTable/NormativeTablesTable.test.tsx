import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NormativeTablesTable } from "./NormativeTablesTable";

describe("NormativeTablesTable", () => {
	it("offers to clear the filters when they leave no table", () => {
		const onClearFilters = vi.fn();
		render(
			<NormativeTablesTable
				tables={[]}
				onOpen={vi.fn()}
				onClearFilters={onClearFilters}
			/>,
		);

		expect(
			screen.getByText(
				"Nenhuma tabela encontrada para os critérios informados",
			),
		).toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: "Limpar Filtros" }));

		expect(onClearFilters).toHaveBeenCalledOnce();
	});

	it("asks for the first table without filters", () => {
		render(<NormativeTablesTable tables={[]} onOpen={vi.fn()} />);

		expect(screen.getByText("Nenhuma tabela cadastrada")).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "Limpar Filtros" }),
		).not.toBeInTheDocument();
	});
});
