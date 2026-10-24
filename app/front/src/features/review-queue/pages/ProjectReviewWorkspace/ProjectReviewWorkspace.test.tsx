import { useFindingRegistrar } from "@features/projects";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

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
	assign: vi.fn(),
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
	useMatchRoute: () => () => false,
	Outlet: () => <Section />,
	Link: ({ children }: { children: ReactNode }) => <a href="/">{children}</a>,
}));

vi.mock("@services/projects", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/projects")>()),
	useGetProject: () =>
		loadedQuery({ data: makeProjectDetail({ ownerId: state.ownerId }) }),
}));

vi.mock("@services/project-review", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/project-review")>()),
	useAssignProjectReview: () =>
		idleMutation({ isSuccess: state.holdsReview, mutate: state.assign }),
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
	useGetConsumerUnitGroupList: () => loadedQuery({ data: [] }),
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

const renderWorkspace = () =>
	render(
		<QueryClientProvider client={new QueryClient()}>
			<ProjectReviewWorkspace projectId="4" />
		</QueryClientProvider>,
	);

describe("ProjectReviewWorkspace", () => {
	beforeEach(() => {
		state.holdsReview = true;
		state.ownerId = "2";
		state.assign.mockClear();
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

	it("takes the review as soon as the project opens", () => {
		signInAs("admin");
		renderWorkspace();

		expect(state.assign).toHaveBeenCalledWith("4");
	});
});
