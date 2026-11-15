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
	it("keeps the designer out of the revisions", () => {
		signInAs("user");
		renderPage();

		expect(
			screen.queryByRole("button", { name: "Nova Revisão" }),
		).not.toBeInTheDocument();
	});

	it.each([
		"reviewer",
		"admin",
	] as const)("lets the %s register a revision", (role) => {
		signInAs(role);
		renderPage();

		expect(screen.getByRole("button", { name: "Nova Revisão" })).toBeVisible();
	});
});
