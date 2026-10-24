import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { describe, expect, it, vi } from "vitest";

import { signInAs } from "@/test/fixtures/project-detail";

import { NormativeTablesPage } from "./NormativeTablesPage";

vi.mock("@services/normative-tables", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/normative-tables")>()),
	useGetNormativeTableList: () => ({
		isPending: false,
		isError: false,
		data: { data: [] },
	}),
	useGetNormativeTableCodes: () => ({ isPending: false, data: { data: [] } }),
	useGetNormativeTable: () => ({ isPending: true }),
}));

const renderPage = () =>
	render(
		<QueryClientProvider client={new QueryClient()}>
			<NuqsTestingAdapter>
				<NormativeTablesPage />
			</NuqsTestingAdapter>
		</QueryClientProvider>,
	);

describe("NormativeTablesPage", () => {
	it("keeps the analyst in read mode", () => {
		signInAs("reviewer");
		renderPage();

		expect(
			screen.queryByRole("button", { name: "Nova Tabela" }),
		).not.toBeInTheDocument();
	});

	it("lets the admin register a table", () => {
		signInAs("admin");
		renderPage();

		expect(screen.getByRole("button", { name: "Nova Tabela" })).toBeVisible();
	});
});
