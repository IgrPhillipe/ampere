import type { SortDirection } from "@features/shared";
import type { ProjectEvent, ProjectRework } from "@services/project-events";
import type { Finding } from "@services/project-review";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { loadedQuery } from "@/test/fixtures/project-detail";

import { ProjectHistoryPage } from "./ProjectHistoryPage";

const makeEvent = (overrides: Partial<ProjectEvent> = {}): ProjectEvent => ({
	id: "1",
	type: "CREATED",
	version: 0,
	description: "Projeto criado.",
	detail: null,
	authorName: "Ana Lima",
	authorRole: "user",
	occurredAt: "2026-08-22T12:00:00Z",
	...overrides,
});

const EVENTS = [
	makeEvent(),
	makeEvent({
		id: "2",
		type: "SUBMITTED",
		version: 1,
		description: "Versão 1 enviada para análise.",
		occurredAt: "2026-08-22T12:30:00Z",
	}),
	makeEvent({
		id: "3",
		type: "PRE_VALIDATED",
		version: 1,
		description: "Pré-validação com 1 alerta.",
		authorName: null,
		authorRole: null,
		occurredAt: "2026-08-22T12:30:01Z",
	}),
	makeEvent({
		id: "4",
		type: "REJECTED",
		version: 1,
		description: "Reprovado com 3 apontamentos.",
		detail: "Corrija a ART antes de reenviar.",
		authorName: "Lucas Gabriel",
		authorRole: "admin",
		occurredAt: "2026-08-26T14:02:00Z",
	}),
];

const REWORK: ProjectRework = {
	cycleDays: 10,
	submittedVersions: 1,
	reviewCycles: 1,
	resolvedFindings: 0,
	openFindings: 3,
	redoneCalculationSteps: 0,
};

const state = vi.hoisted(() => ({
	events: [] as ProjectEvent[],
	directions: [] as (SortDirection | undefined)[],
	failed: false,
	refetches: [] as string[],
	status: "UNDER_REVIEW",
	findings: [] as Pick<Finding, "id" | "status">[],
}));

/** Stands in for the API: it sorts by the direction it receives. */
vi.mock("@services/project-events", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/project-events")>()),
	useGetProjectEventList: (
		_projectId: string,
		{ direction }: { direction?: SortDirection } = {},
	) => {
		state.directions.push(direction);
		if (state.failed)
			return {
				...loadedQuery(undefined),
				isError: true,
				refetch: () => state.refetches.push("events"),
			};
		const ascending = [...state.events].sort((a, b) =>
			a.occurredAt.localeCompare(b.occurredAt),
		);

		return loadedQuery({
			data: direction === "ASC" ? ascending : ascending.reverse(),
		});
	},
	useGetProjectRework: () => ({
		...loadedQuery({ data: REWORK }),
		refetch: () => state.refetches.push("rework"),
	}),
}));

vi.mock("@services/projects", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/projects")>()),
	useGetProject: () => loadedQuery({ data: { status: state.status } }),
}));

vi.mock("@services/project-review", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/project-review")>()),
	useGetFindingList: () => loadedQuery({ data: state.findings }),
}));

const timelineDescriptions = () =>
	EVENTS.map(({ description }) => description).sort((a, b) =>
		screen.getByText(a).compareDocumentPosition(screen.getByText(b)) &
		Node.DOCUMENT_POSITION_PRECEDING
			? 1
			: -1,
	);

describe("ProjectHistoryPage", () => {
	beforeEach(() => {
		state.events = EVENTS;
		state.directions = [];
		state.failed = false;
		state.refetches = [];
		state.status = "UNDER_REVIEW";
		state.findings = [];
	});

	it("lists the most recent event first by default", () => {
		render(<ProjectHistoryPage projectId="4" />);

		expect(state.directions.at(-1)).toBe("DESC");
		expect(timelineDescriptions()).toEqual([
			"Reprovado com 3 apontamentos.",
			"Pré-validação com 1 alerta.",
			"Versão 1 enviada para análise.",
			"Projeto criado.",
		]);
		expect(
			screen.getByRole("button", { name: /mais recente primeiro/i }),
		).toHaveAttribute("aria-pressed", "true");
	});

	it("asks the API for the oldest first when the toggle is turned off, and back", () => {
		render(<ProjectHistoryPage projectId="4" />);
		const toggle = screen.getByRole("button", {
			name: /mais recente primeiro/i,
		});

		fireEvent.click(toggle);

		expect(state.directions.at(-1)).toBe("ASC");
		expect(toggle).toHaveAttribute("aria-pressed", "false");
		expect(timelineDescriptions()).toEqual([
			"Projeto criado.",
			"Versão 1 enviada para análise.",
			"Pré-validação com 1 alerta.",
			"Reprovado com 3 apontamentos.",
		]);

		fireEvent.click(toggle);

		expect(state.directions.at(-1)).toBe("DESC");
		expect(timelineDescriptions()[0]).toBe("Reprovado com 3 apontamentos.");
	});

	it("names the author's role as designer, analyst or system", () => {
		render(<ProjectHistoryPage projectId="4" />);
		const items = within(screen.getByRole("list")).getAllByRole("listitem");

		expect(items[0]).toHaveTextContent("Lucas Gabriel, Analista");
		expect(items[1]).toHaveTextContent("Sistema");
		expect(items[2]).toHaveTextContent("Ana Lima, Projetista");
		expect(items[2]).toHaveTextContent("Enviado, Versão 1");
	});

	it("shows the empty state for a project without events", () => {
		state.events = [];

		render(<ProjectHistoryPage projectId="4" />);

		expect(screen.getByText("Nenhum evento registrado")).toBeInTheDocument();
		expect(screen.queryByRole("list")).not.toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /mais recente primeiro/i }),
		).toBeDisabled();
	});

	it("shows the cycle in days and the rework metrics", () => {
		render(<ProjectHistoryPage projectId="4" />);

		expect(screen.getByText("10")).toBeInTheDocument();
		expect(
			screen.getByText("Apontamentos em aberto").nextSibling,
		).toHaveTextContent("03");
	});

	it("names the cycle up to the approval and counts the findings waiting for the analyst", () => {
		state.status = "APPROVED";
		state.findings = [
			{ id: "1", status: "FIXED" },
			{ id: "2", status: "RESOLVED" },
		];

		render(<ProjectHistoryPage projectId="4" />);

		expect(
			screen.getByText("Dias do primeiro envio à aprovação"),
		).toBeInTheDocument();
		expect(
			screen.getByText(
				"Um apontamento corrigido aguarda a conferência do analista.",
			),
		).toBeInTheDocument();
	});

	it("offers to retry both requests when the history fails", () => {
		state.failed = true;

		render(<ProjectHistoryPage projectId="4" />);

		expect(
			screen.getByText("Não foi possível carregar o histórico"),
		).toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: "Tentar Novamente" }));

		expect(state.refetches).toEqual(["events", "rework"]);
	});
});
