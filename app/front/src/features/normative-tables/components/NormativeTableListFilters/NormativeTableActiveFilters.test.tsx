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
		renderChips("?search=quadro&status=DRAFT,SUPERSEDED&standard=DIS_NOR_053");

		expect(screen.getByText("Busca: quadro")).toBeInTheDocument();
		expect(
			screen.getByText("Situação: Aguardando Revisão"),
		).toBeInTheDocument();
		expect(screen.getByText("Situação: Substituída")).toBeInTheDocument();
		expect(screen.getByText("Norma: DIS-NOR-053")).toBeInTheDocument();
	});

	it("removes one status and keeps the others", async () => {
		const lastUrl = renderChips("?status=DRAFT,SUPERSEDED");

		fireEvent.click(
			screen.getByRole("button", {
				name: "Remover filtro Situação: Aguardando Revisão",
			}),
		);

		await waitFor(() => expect(lastUrl()?.get("status")).toBe("SUPERSEDED"));
	});

	it("renders nothing without filters", () => {
		renderChips("?sort=title");

		expect(
			screen.queryByRole("group", { name: "Filtros ativos" }),
		).not.toBeInTheDocument();
	});
});
