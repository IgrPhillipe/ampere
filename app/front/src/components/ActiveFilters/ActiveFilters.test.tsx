import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ActiveFilters } from "./ActiveFilters";

describe("ActiveFilters", () => {
	it("renders nothing without active filters", () => {
		const { container } = render(
			<ActiveFilters filters={[]} onClear={vi.fn()} />,
		);

		expect(container).toBeEmptyDOMElement();
	});

	it("removes one filter or clears them all", () => {
		const onRemove = vi.fn();
		const onClear = vi.fn();
		render(
			<ActiveFilters
				filters={[
					{ id: "municipality", label: "Município: Recife/PE", onRemove },
				]}
				onClear={onClear}
			/>,
		);

		fireEvent.click(
			screen.getByRole("button", {
				name: "Remover filtro Município: Recife/PE",
			}),
		);
		fireEvent.click(screen.getByRole("button", { name: "Limpar Filtros" }));

		expect(onRemove).toHaveBeenCalledOnce();
		expect(onClear).toHaveBeenCalledOnce();
	});
});
