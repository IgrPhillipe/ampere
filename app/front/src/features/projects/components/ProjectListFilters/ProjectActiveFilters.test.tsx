import { projectKeys } from "@services/projects";
import { getProjectOwnerList } from "@services/projects/requests";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import type { PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useProjectFilters } from "../../hooks";
import { ProjectActiveFilters } from "./ProjectActiveFilters";

vi.mock("@services/projects/requests", () => ({
	getProjectOwnerList: vi.fn(),
}));

const Chips = () => <ProjectActiveFilters filters={useProjectFilters()} />;

const renderChips = (searchParams: string, cachedOwners?: boolean) => {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});

	if (cachedOwners) {
		queryClient.setQueryData(projectKeys.owners(), {
			data: [{ id: "5", name: "Beto Projetista" }],
		});
	}

	const onUrlUpdate = vi.fn();
	const NuqsAdapter = withNuqsTestingAdapter({
		searchParams,
		hasMemory: true,
		onUrlUpdate,
	});
	const wrapper = ({ children }: PropsWithChildren) => (
		<QueryClientProvider client={queryClient}>
			<NuqsAdapter>{children}</NuqsAdapter>
		</QueryClientProvider>
	);
	render(<Chips />, { wrapper });

	return () => onUrlUpdate.mock.lastCall?.[0]?.searchParams;
};

describe("ProjectActiveFilters", () => {
	beforeEach(() => {
		vi.mocked(getProjectOwnerList).mockReturnValue(new Promise(vi.fn()));
	});

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

	it("names the designer once the list is loaded", () => {
		renderChips("?owner=5", true);

		expect(screen.getByText("Projetista: Beto Projetista")).toBeInTheDocument();
	});

	it("waits for the names instead of showing the raw id", () => {
		renderChips("?owner=5");

		expect(screen.queryByText(/Projetista:/)).not.toBeInTheDocument();
	});
});
