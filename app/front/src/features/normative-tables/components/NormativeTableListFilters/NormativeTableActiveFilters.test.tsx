import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { describe, expect, it, vi } from "vitest";

import { useNormativeTableFilters } from "../../hooks";
import { NormativeTableActiveFilters } from "./NormativeTableActiveFilters";

const Chips = () => (
	<NormativeTableActiveFilters filters={useNormativeTableFilters()} />
);

const renderChips = (searchParams: string) => {
	const onUrlUpdate = vi.fn();
	render(<Chips />, {
		wrapper: withNuqsTestingAdapter({
			searchParams,
			hasMemory: true,
			onUrlUpdate,
		}),
	});

	return () => onUrlUpdate.mock.lastCall?.[0]?.searchParams;
};

describe("NormativeTableActiveFilters", () => {
	it("labels each active filter", () => {
		renderChips("?search=quadro&status=DRAFT");

		expect(screen.getByText("Busca: quadro")).toBeInTheDocument();
		expect(
			screen.getByText("Situação: Aguardando Revisão"),
		).toBeInTheDocument();
	});

	it("removes the status and keeps the search", async () => {
		const lastUrl = renderChips("?search=quadro&status=SUPERSEDED");

		fireEvent.click(
			screen.getByRole("button", {
				name: "Remover filtro Situação: Substituída",
			}),
		);

		await waitFor(() => expect(lastUrl()?.has("status")).toBe(false));
		expect(lastUrl()?.get("search")).toBe("quadro");
	});

	it("renders nothing without filters", () => {
		renderChips("?sort=title");

		expect(
			screen.queryByRole("group", { name: "Filtros ativos" }),
		).not.toBeInTheDocument();
	});
});
