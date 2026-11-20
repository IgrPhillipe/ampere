import type {
	NormativeTable,
	NormativeTableCode,
} from "@services/normative-tables";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { signInAs } from "@/test/fixtures/project-detail";

import { NormativeTableForm } from "./NormativeTableForm";

const code: NormativeTableCode = {
	code: "Q37_SAFETY_FACTOR",
	standard: "DIS-NOR-053",
	identification: "Quadro 37",
	title: "Fator de segurança",
	item: "Anexo I, item 5",
	page: "108",
	keys: [],
	argumentLabel: "Demanda (kVA)",
	valueLabels: ["Fator"],
};

const draft = (registeredBy: string): NormativeTable => ({
	id: "1",
	standard: { name: "DIS-NOR-053", revision: "REV 06" },
	code: code.code,
	title: code.title,
	identification: code.identification,
	item: code.item,
	page: code.page,
	version: 0,
	status: "DRAFT",
	rowCount: 1,
	registeredBy,
	registeredByName: registeredBy,
	registeredAt: "2026-11-10T12:00:00Z",
	rows: [{ upperBound: 25, value: 1.5 }],
});

const queryClient = new QueryClient();

const form = (table?: NormativeTable) => (
	<QueryClientProvider client={queryClient}>
		<NormativeTableForm
			table={table}
			codes={[code]}
			onCreated={vi.fn()}
			onClose={vi.fn()}
		/>
	</QueryClientProvider>
);

const renderForm = (table?: NormativeTable) => render(form(table));

describe("NormativeTableForm", () => {
	it("explains that only the tables the calculation reads exist", () => {
		signInAs("reviewer");
		renderForm();

		expect(
			screen.getByText(/Só aparecem as tabelas que o cálculo de demanda lê/),
		).toBeVisible();
	});

	it("lets the reviewer approve, but not change, someone else's revision", () => {
		signInAs("reviewer", { email: "revisor@ampere.com" });
		renderForm(draft("analista@ampere.com"));

		expect(
			screen.getByRole("button", { name: "Aprovar e Publicar" }),
		).toBeVisible();
		expect(screen.getByRole("button", { name: "Fechar" })).toBeVisible();
		expect(
			screen.queryByRole("button", { name: "Salvar" }),
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "Excluir" }),
		).not.toBeInTheDocument();
		expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
	});

	it("lets the admin delete someone else's revision", () => {
		signInAs("admin", { email: "admin@ampere.com" });
		renderForm(draft("revisor@ampere.com"));

		expect(screen.getByRole("button", { name: "Excluir" })).toBeVisible();
		expect(
			screen.queryByRole("button", { name: "Salvar" }),
		).not.toBeInTheDocument();
	});

	it("keeps whoever registered the revision from approving it", () => {
		signInAs("reviewer", { email: "revisor@ampere.com" });
		renderForm(draft("revisor@ampere.com"));

		expect(screen.getByRole("button", { name: "Salvar" })).toBeVisible();
		expect(screen.getByRole("button", { name: "Excluir" })).toBeVisible();
		expect(
			screen.queryByRole("button", { name: "Aprovar e Publicar" }),
		).not.toBeInTheDocument();
	});

	it("shows the rows of a newer version the approver refetched", () => {
		signInAs("reviewer", { email: "revisor@ampere.com" });
		const { rerender } = renderForm(draft("analista@ampere.com"));

		rerender(
			form({
				...draft("analista@ampere.com"),
				version: 1,
				rows: [{ upperBound: 25, value: 7 }],
			}),
		);

		expect(screen.getByText("7")).toBeVisible();
		expect(screen.queryByText("1,5")).not.toBeInTheDocument();
	});
});
