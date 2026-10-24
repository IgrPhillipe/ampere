import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
	idleMutation,
	loadedQuery,
	makeChecklist,
	makeFinding,
	makeProjectDetail,
	signInAs,
} from "@/test/fixtures/project-detail";

import { ProjectReviewPage } from "./ProjectReviewPage";

const state = vi.hoisted(() => ({ holdsReview: true }));

vi.mock("@tanstack/react-router", () => ({ useNavigate: () => vi.fn() }));

vi.mock("@services/projects", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/projects")>()),
	useGetProject: () => loadedQuery({ data: makeProjectDetail() }),
}));

vi.mock("@services/project-review", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/project-review")>()),
	useAssignProjectReview: () => idleMutation({ isSuccess: state.holdsReview }),
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
}));

vi.mock("@services/submission", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/submission")>()),
	useGetSubmission: () => loadedQuery({ data: makeChecklist() }),
}));

describe("ProjectReviewPage", () => {
	it("lets the analyst holding the review record findings and decide", () => {
		signInAs("admin");
		state.holdsReview = true;
		render(<ProjectReviewPage projectId="4" />);

		expect(screen.getByText("Protocolo 2026-1004")).toBeVisible();
		expect(screen.getByText("Verificação Automática")).toBeVisible();
		expect(screen.getByText("Novo Apontamento")).toBeVisible();
		expect(
			screen.getByRole("button", { name: "Aprovar Projeto" }),
		).toBeVisible();
		expect(
			screen.getByRole("button", { name: "Reprovar com Apontamentos" }),
		).toBeVisible();
		expect(
			screen.queryByRole("button", { name: "Reenviar Projeto" }),
		).not.toBeInTheDocument();
	});

	it("keeps the analyst read only when someone else holds the review", () => {
		signInAs("admin");
		state.holdsReview = false;
		render(<ProjectReviewPage projectId="4" />);

		expect(screen.queryByText("Novo Apontamento")).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "Aprovar Projeto" }),
		).not.toBeInTheDocument();
	});

	it("gives no analyst action to the designer", () => {
		signInAs("user");
		state.holdsReview = true;
		render(<ProjectReviewPage projectId="4" />);

		expect(screen.queryByText("Novo Apontamento")).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "Aprovar Projeto" }),
		).not.toBeInTheDocument();
	});
});
