import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { describe, expect, it, vi } from "vitest";

import { useProjectFilters } from "../../hooks";
import { ProjectActiveFilters } from "./ProjectActiveFilters";

const Chips = () => <ProjectActiveFilters filters={useProjectFilters()} />;

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

describe("ProjectActiveFilters", () => {
	it("labels each active filter", () => {
		renderChips(
			"?municipality=Recife&createdFrom=2026-08-01&createdTo=2026-08-31&findings=BLOCKING_OPEN",
		);

		expect(screen.getByText("Município: Recife")).toBeInTheDocument();
		expect(
			screen.getByText("Criado de 01/08/2026 a 31/08/2026"),
		).toBeInTheDocument();
		expect(
			screen.getByText("Apontamentos: bloqueante em aberto"),
		).toBeInTheDocument();
	});

	it("labels an open-ended period", () => {
		renderChips("?createdTo=2026-08-31");

		expect(screen.getByText("Criado até 31/08/2026")).toBeInTheDocument();
	});

	it("removes both ends of the period at once", async () => {
		const lastUrl = renderChips(
			"?createdFrom=2026-08-01&createdTo=2026-08-31&sort=name",
		);

		fireEvent.click(
			screen.getByRole("button", {
				name: "Remover filtro Criado de 01/08/2026 a 31/08/2026",
			}),
		);

		await waitFor(() => expect(lastUrl()?.toString()).toBe("sort=name"));
	});
});
