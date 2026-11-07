import { useFindingRegistrar } from "@features/projects";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { httpErrorOf } from "@/test/fixtures/http-error";
import {
	idleMutation,
	loadedQuery,
	makeChecklist,
	makeFinding,
	makeProjectDetail,
	signInAs,
} from "@/test/fixtures/project-detail";

import { ProjectReviewWorkspace } from "./ProjectReviewWorkspace";

const state = vi.hoisted(() => ({
	holdsReview: true,
	ownerId: "2",
	reviewerName: null as string | null,
	openError: null as unknown,
	activeRoute: "/projetos/$id",
	openReview: vi.fn(),
}));

const Section = () => {
	const registrar = useFindingRegistrar();

	return registrar.onCheck ? (
		<button
			type="button"
			onClick={() =>
				registrar.onCheck?.({
					code: "EV_NETWORK_STUDY",
					status: "WARNING",
					message: "Recarga acima de 20 kW exige estudo da rede.",
				})
			}
		>
			Virar Apontamento
		</button>
	) : null;
};

vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => vi.fn(),
	useMatchRoute:
		() =>
		({ to }: { to: string }) =>
			state.activeRoute === to,
	Outlet: () => <Section />,
	Link: ({ children }: { children: ReactNode }) => <a href="/">{children}</a>,
}));

vi.mock("@services/projects", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/projects")>()),
	useGetProject: () =>
		loadedQuery({
			data: makeProjectDetail({
				ownerId: state.ownerId,
				reviewerName: state.reviewerName,
			}),
		}),
}));

vi.mock("@services/project-review", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/project-review")>()),
	useOpenProjectReview: () =>
		idleMutation({
			isSuccess: state.holdsReview,
			error: state.openError,
			mutate: state.openReview,
		}),
	useGetFindingList: () =>
		loadedQuery({ data: [makeFinding({ status: "DRAFT", version: 1 })] }),
	useCreateFinding: () => idleMutation(),
	useUpdateFinding: () => idleMutation(),
	useDeleteFinding: () => idleMutation(),
	useResolveFinding: () => idleMutation(),
	useDecideProjectReview: () => idleMutation(),
	useGetDocumentFile: () => ({ isPending: true }),
}));

vi.mock("@services/calculation", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/calculation")>()),
	useGetLatestCalculation: () =>
		loadedQuery({ data: { checks: [], steps: [], totals: { finalKva: 76 } } }),
}));

vi.mock("@services/consumer-units", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/consumer-units")>()),
	useGetConsumerUnitGroupList: () =>
		loadedQuery({ data: [{ id: "7", name: "Recarga veicular" }] }),
	useGetConsumerUnitGroupValidation: () =>
		loadedQuery({
			data: { totalUnits: 12, totalGroups: 2, totalDeclaredLoadKw: 80 },
		}),
	useUpdateConsumerUnitGroup: () => idleMutation(),
	useDeleteConsumerUnitGroup: () => idleMutation(),
}));

vi.mock("@services/submission", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/submission")>()),
	useGetSubmission: () => loadedQuery({ data: makeChecklist() }),
	useGetMemorial: () => ({ isPending: true }),
}));

const workspace = () => (
	<QueryClientProvider client={new QueryClient()}>
		<ProjectReviewWorkspace projectId="4" />
	</QueryClientProvider>
);

const renderWorkspace = () => render(workspace());

const pickOption = async (name: string) => {
	const option = await screen.findByRole("option", { name });
	fireEvent.pointerDown(option);
	fireEvent.click(option);
	await waitFor(() => expect(screen.queryAllByRole("option")).toHaveLength(0));
};

describe("ProjectReviewWorkspace", () => {
	beforeEach(() => {
		state.holdsReview = true;
		state.ownerId = "2";
		state.openReview.mockClear();
		state.reviewerName = null;
		state.openError = null;
		state.activeRoute = "/projetos/$id";
	});

	it.each([
		["/projetos/$id/dados", "Dados da Edificação"],
		["/projetos/$id/unidades", "Unidades Consumidoras"],
		["/projetos/$id/calculo", "Cálculo de Demanda"],
		["/projetos/$id/documentos", "Documentos"],
	])("starts a blank finding in the section for %s", (route, stage) => {
		signInAs("reviewer");
		state.activeRoute = route;
		renderWorkspace();

		expect(screen.getByRole("combobox", { name: /^Seção/ })).toHaveTextContent(
			stage,
		);
	});

	it.each([
		["/projetos/$id", "Visão Geral"],
		["/projetos/$id/memorial", "Memorial"],
		["/projetos/$id/historico", "Histórico"],
	])("leaves a blank finding without a section on %s (%s)", (route) => {
		signInAs("reviewer");
		state.activeRoute = route;
		renderWorkspace();

		expect(screen.getByRole("combobox", { name: /^Seção/ })).toHaveTextContent(
			"Selecione uma opção",
		);
	});

	it("updates an empty form when the project section changes", async () => {
		signInAs("reviewer");
		const { rerender } = renderWorkspace();

		fireEvent.click(screen.getByRole("combobox", { name: /^Seção/ }));
		await pickOption("Documentos");
		state.activeRoute = "/projetos/$id/unidades";
		rerender(workspace());

		expect(screen.getByRole("combobox", { name: /^Seção/ })).toHaveTextContent(
			"Unidades Consumidoras",
		);
	});

	it("keeps the form section and description when the analyst has started typing", () => {
		signInAs("reviewer");
		state.activeRoute = "/projetos/$id/dados";
		const { rerender } = renderWorkspace();
		fireEvent.change(screen.getByRole("textbox", { name: /^Descrição/ }), {
			target: { value: "Ajustar os dados da edificação." },
		});

		state.activeRoute = "/projetos/$id/calculo";
		rerender(workspace());

		expect(screen.getByRole("combobox", { name: /^Seção/ })).toHaveTextContent(
			"Dados da Edificação",
		);
		expect(screen.getByRole("textbox", { name: /^Descrição/ })).toHaveValue(
			"Ajustar os dados da edificação.",
		);
	});

	it("keeps an edited finding unchanged when the project section changes", () => {
		signInAs("reviewer");
		const { rerender } = renderWorkspace();

		fireEvent.click(
			screen.getByRole("button", {
				name: /A ART não traz a assinatura do responsável técnico/,
			}),
		);
		fireEvent.click(screen.getByRole("button", { name: "Editar" }));
		state.activeRoute = "/projetos/$id/unidades";
		rerender(workspace());

		expect(screen.getByRole("combobox", { name: /^Seção/ })).toHaveTextContent(
			"Documentos",
		);
		expect(screen.getByRole("textbox", { name: /^Descrição/ })).toHaveValue(
			"A ART não traz a assinatura do responsável técnico.",
		);
	});

	it("clears the reference when the analyst changes the section manually", async () => {
		signInAs("reviewer");
		renderWorkspace();

		fireEvent.click(screen.getByRole("combobox", { name: /^Seção/ }));
		await pickOption("Unidades Consumidoras");
		expect(screen.getByRole("combobox", { name: /^Seção/ })).toHaveTextContent(
			"Unidades Consumidoras",
		);
		fireEvent.click(await screen.findByRole("combobox", { name: /^Grupo/ }));
		await pickOption("Recarga veicular");
		expect(
			await screen.findByRole("combobox", { name: /^Grupo/ }),
		).toHaveTextContent("Recarga veicular");

		fireEvent.click(screen.getByRole("combobox", { name: /^Seção/ }));
		await pickOption("Dados da Edificação");
		fireEvent.click(screen.getByRole("combobox", { name: /^Seção/ }));
		await pickOption("Unidades Consumidoras");

		expect(
			await screen.findByRole("combobox", { name: /^Grupo/ }),
		).not.toHaveTextContent("Recarga veicular");
	});

	it("lets the analyst holding the review record findings and decide", () => {
		signInAs("reviewer");
		renderWorkspace();

		expect(screen.getByText("Protocolo 2026-1004")).toBeVisible();
		expect(screen.getByRole("link", { name: "Fila de Análise" })).toBeVisible();
		expect(screen.getByText("Novo Apontamento")).toBeVisible();
		// The draft finding leaves rejection as the only decision.
		expect(
			screen.getByRole("button", { name: "Reprovar com Apontamentos" }),
		).toBeVisible();
		expect(
			screen.queryByRole("button", { name: "Aprovar Projeto" }),
		).not.toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /^Documentos.*1 apontamento/ }),
		).toBeVisible();
	});

	it("starts a finding from an item of a section", () => {
		signInAs("reviewer");
		renderWorkspace();

		fireEvent.click(screen.getByRole("button", { name: "Virar Apontamento" }));
		expect(
			screen.getByDisplayValue("Recarga acima de 20 kW exige estudo da rede."),
		).toBeVisible();
	});

	it("keeps the analyst read only when someone else holds the review", () => {
		signInAs("reviewer");
		state.holdsReview = false;
		renderWorkspace();

		expect(screen.queryByText("Novo Apontamento")).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "Virar Apontamento" }),
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "Aprovar Projeto" }),
		).not.toBeInTheDocument();
	});

	it("opens the review as soon as the project opens", () => {
		signInAs("admin");
		renderWorkspace();

		expect(state.openReview).toHaveBeenCalledWith("4");
	});

	it("names the responsible analyst to whoever only consults", async () => {
		state.holdsReview = false;
		state.reviewerName = "Ana Analista";
		state.openError = await httpErrorOf(403, {});
		signInAs("reviewer");
		renderWorkspace();

		expect(screen.getByRole("status")).toHaveTextContent(
			"Em análise por Ana Analista.",
		);
	});

	it("tells when the project still has no analyst", async () => {
		state.holdsReview = false;
		state.openError = await httpErrorOf(403, {});
		signInAs("reviewer");
		renderWorkspace();

		expect(screen.getByRole("status")).toHaveTextContent(
			"Projeto sem analista responsável.",
		);
	});
});
