import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	loadedQuery,
	makeChecklist,
	makeFinding,
	makeProjectDetail,
	signInAs,
} from "@/test/fixtures/project-detail";

import { SubmissionConfirmationPage } from "./SubmissionConfirmationPage";

const state = vi.hoisted(() => ({
	project: undefined as unknown,
	findings: [] as unknown[],
	redirectedTo: undefined as string | undefined,
}));

vi.mock("@tanstack/react-router", () => ({
	Link: ({ children }: { children: ReactNode }) => <a href="/">{children}</a>,
	Navigate: ({ to }: { to: string }) => {
		state.redirectedTo = to;
		return null;
	},
}));

vi.mock("@services/projects", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/projects")>()),
	useGetProject: () => loadedQuery({ data: state.project }),
}));

vi.mock("@services/project-review", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/project-review")>()),
	useGetFindingList: () => loadedQuery({ data: state.findings }),
}));

vi.mock("@services/calculation", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/calculation")>()),
	useGetLatestCalculation: () => loadedQuery(null),
}));

vi.mock("@services/submission", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/submission")>()),
	useGetSubmission: () => loadedQuery({ data: makeChecklist() }),
	useGetMemorial: () => ({ refetch: vi.fn(), isFetching: false }),
}));

describe("SubmissionConfirmationPage", () => {
	beforeEach(() => {
		signInAs("user");
		state.findings = [];
		state.redirectedTo = undefined;
	});

	it("gives the owner the protocol and what comes next", () => {
		state.project = makeProjectDetail({ ownerId: "1" });
		render(<SubmissionConfirmationPage projectId="4" />);

		expect(
			screen.getByRole("heading", { name: "Projeto Enviado para Análise" }),
		).toBeVisible();
		expect(screen.getByText("Protocolo gerado")).toBeVisible();
		expect(screen.getByText("2026-1004")).toBeVisible();
		expect(screen.getByText("Até 01/11/2026")).toBeVisible();
		expect(screen.getByText("Unidades consumidoras")).toBeVisible();
		expect(state.redirectedTo).toBeUndefined();
	});

	it("lists the answered findings of a resubmission", () => {
		state.project = makeProjectDetail({ ownerId: "1", reviewCycle: 2 });
		state.findings = [
			makeFinding({ status: "FIXED", response: "ART assinada anexada." }),
			makeFinding({ id: "2", status: "OPEN", description: "Ainda aberto." }),
		];
		render(<SubmissionConfirmationPage projectId="4" />);

		expect(
			screen.getByRole("heading", { name: "Projeto Reenviado para Análise" }),
		).toBeVisible();
		expect(screen.getByText("Protocolo mantido")).toBeVisible();
		expect(screen.getByText("Versão 02 em análise, reanálise")).toBeVisible();
		expect(
			screen.getByText("A ART não traz a assinatura do responsável técnico."),
		).toBeVisible();
		expect(screen.queryByText("Ainda aberto.")).not.toBeInTheDocument();
	});

	it.each([
		"DRAFT",
		"REJECTED",
		"APPROVED",
	] as const)("sends a %s project back to its overview", (status) => {
		state.project = makeProjectDetail({ ownerId: "1", status });
		render(<SubmissionConfirmationPage projectId="4" />);

		expect(state.redirectedTo).toBe("/projetos/$id");
	});

	it("sends whoever does not own the project back to its overview", () => {
		state.project = makeProjectDetail({ ownerId: "2" });
		render(<SubmissionConfirmationPage projectId="4" />);

		expect(state.redirectedTo).toBe("/projetos/$id");
	});
});
