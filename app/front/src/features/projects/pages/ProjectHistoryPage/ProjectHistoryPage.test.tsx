import type { SortDirection } from "@features/shared";
import type { ProjectEvent, ProjectRework } from "@services/project-events";
import type { Finding } from "@services/project-review";
import type {
	ProjectVersion,
	VersionComparison,
} from "@services/project-versions";
import { fireEvent, render, screen, within } from "@testing-library/react";
import {
	NuqsTestingAdapter,
	type OnUrlUpdateFunction,
} from "nuqs/adapters/testing";
import type { ReactNode } from "react";
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
	versions: [] as ProjectVersion[],
	compared: [] as { from: number; to: number }[],
	comparison: undefined as VersionComparison | undefined,
	download: vi.fn(),
}));

vi.mock("@services/project-versions", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/project-versions")>()),
	useGetProjectVersionList: () => loadedQuery({ data: state.versions }),
	useCompareProjectVersions: (
		params: { from: number; to: number },
		{ enabled }: { enabled?: boolean } = {},
	) => {
		if (enabled) state.compared.push({ from: params.from, to: params.to });
		return enabled
			? loadedQuery(state.comparison ? { data: state.comparison } : undefined)
			: { ...loadedQuery(undefined), isPending: true };
	},
	useDownloadVersionMemorial: () => ({
		mutate: state.download,
		isPending: false,
	}),
}));

vi.mock("@tanstack/react-router", async (importOriginal) => ({
	...(await importOriginal<typeof import("@tanstack/react-router")>()),
	Link: ({
		children,
		to,
		search,
		className,
		"aria-label": ariaLabel,
	}: {
		children: ReactNode;
		to: string;
		search?: Record<string, string>;
		className?: string;
		"aria-label"?: string;
	}) => (
		<a
			href={`${to}${search ? `?${new URLSearchParams(search)}` : ""}`}
			className={className}
			aria-label={ariaLabel}
		>
			{children}
		</a>
	),
}));

const versionOf = (number: number, demandKva: number): ProjectVersion => ({
	number,
	submittedAt: `2026-08-2${number}T12:00:00Z`,
	authorName: "Ana Lima",
	changeSummary: null,
	demandKva,
	documents: [],
	memorialSha256: "a".repeat(64),
	verificationCode: `7F3A-91C2-04BD-2E7${number}`,
	approvalMemorial: null,
});

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

const renderPage = (searchParams = "", onUrlUpdate?: OnUrlUpdateFunction) =>
	render(
		<NuqsTestingAdapter searchParams={searchParams} onUrlUpdate={onUrlUpdate}>
			<ProjectHistoryPage projectId="4" />
		</NuqsTestingAdapter>,
	);

describe("ProjectHistoryPage", () => {
	beforeEach(() => {
		state.events = EVENTS;
		state.directions = [];
		state.failed = false;
		state.refetches = [];
		state.status = "UNDER_REVIEW";
		state.findings = [];
		state.versions = [];
		state.compared = [];
		state.comparison = undefined;
		state.download.mockReset();
	});

	it("lists the most recent event first by default", () => {
		renderPage();

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
		renderPage();
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
		renderPage();
		const items = within(screen.getByRole("list")).getAllByRole("listitem");

		expect(items[0]).toHaveTextContent("Lucas Gabriel, Analista");
		expect(items[1]).toHaveTextContent("Sistema");
		expect(items[2]).toHaveTextContent("Ana Lima, Projetista");
		expect(items[2]).toHaveTextContent("Enviado, Versão 1");
	});

	it("shows the empty state for a project without events", () => {
		state.events = [];

		renderPage();

		expect(screen.getByText("Nenhum evento registrado")).toBeInTheDocument();
		expect(screen.queryByRole("list")).not.toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /mais recente primeiro/i }),
		).toBeDisabled();
	});

	it("shows the cycle in days and the rework metrics", () => {
		renderPage();

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

		renderPage();

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

		renderPage();

		expect(
			screen.getByText("Não foi possível carregar o histórico"),
		).toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: "Tentar Novamente" }));

		expect(state.refetches).toEqual(["events", "rework"]);
	});
});

describe("ProjectHistoryPage versions", () => {
	const COMPARISON: VersionComparison = {
		from: { number: 2, submittedAt: "2026-08-22T12:00:00Z", demandKva: 236 },
		to: { number: 3, submittedAt: "2026-08-23T12:00:00Z", demandKva: 238.4 },
		demandDifferenceKva: 2.4,
		included: [{ id: "9", name: "Recarga de veículo elétrico", fields: [] }],
		removed: [],
		changed: [
			{
				id: "5",
				name: "Apartamento tipo A",
				fields: [
					{
						field: "unitCount",
						label: "Unidades",
						from: "24",
						to: "26",
						fromLabel: null,
						toLabel: null,
					},
				],
			},
		],
		building: [],
	};

	beforeEach(() => {
		state.events = EVENTS;
		state.directions = [];
		state.failed = false;
		state.status = "UNDER_REVIEW";
		state.findings = [];
		state.versions = [
			versionOf(1, 230),
			versionOf(2, 236),
			versionOf(3, 238.4),
		];
		state.compared = [];
		state.comparison = COMPARISON;
		state.download.mockReset();
	});

	it("lists the versions newest first, each with its memorial and code", () => {
		renderPage();

		const list = screen.getByRole("list", { name: "Versões enviadas" });
		const items = within(list).getAllByRole("listitem");
		expect(items.map((item) => item.textContent?.slice(0, 3))).toEqual([
			"v03",
			"v02",
			"v01",
		]);
		expect(
			within(items[0]).getByRole("link", {
				name: "Verificar o código 7F3A-91C2-04BD-2E73",
			}),
		).toHaveAttribute(
			"href",
			"/verificar-autenticidade?codigo=7F3A-91C2-04BD-2E73",
		);

		fireEvent.click(
			screen.getByRole("button", { name: "Baixar o memorial da v02" }),
		);
		expect(state.download).toHaveBeenCalledWith(
			{ projectId: "4", version: 2 },
			expect.anything(),
		);
	});

	it("opens the comparison of the latest version against the one before", async () => {
		const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
		renderPage("", onUrlUpdate);

		fireEvent.click(screen.getByRole("button", { name: "Comparar Versões" }));

		await vi.waitFor(() => expect(onUrlUpdate).toHaveBeenCalled());
		const { searchParams } = onUrlUpdate.mock.calls.at(-1)?.[0] ?? {};
		expect(searchParams?.get("de")).toBe("2");
		expect(searchParams?.get("para")).toBe("3");
	});

	it("offers no comparison with a single version", () => {
		state.versions = [versionOf(1, 230)];
		renderPage();

		expect(
			screen.queryByRole("button", { name: "Comparar Versões" }),
		).not.toBeInTheDocument();
	});

	it("shows what changed between the versions in the URL", () => {
		renderPage("?de=2&para=3");

		expect(state.compared.at(-1)).toEqual({ from: 2, to: 3 });
		expect(
			screen.getByRole("heading", { name: "Comparativo de Versões" }),
		).toBeInTheDocument();
		expect(screen.queryByText("Projeto criado.")).not.toBeInTheDocument();

		const demandRow = screen
			.getByText("Demanda total da edificação")
			.closest("tr");
		expect(demandRow).toHaveAttribute("data-changed", "true");
		expect(demandRow).toHaveTextContent("236,0 kVA");
		expect(demandRow).toHaveTextContent("238,4 kVA");
		expect(demandRow).toHaveTextContent("+2,4");

		const groups = screen.getAllByRole("table")[1];
		expect(within(groups).getByText("Unidades: 24 → 26")).toBeInTheDocument();
		expect(within(groups).getByText("Incluído")).toBeInTheDocument();
		expect(within(groups).getByText("Alterado")).toBeInTheDocument();

		const field = screen.getByRole("heading", { name: "O que mudou" })
			.parentElement?.parentElement as HTMLElement;
		expect(within(field).getByText("Alterações na v03")).toBeInTheDocument();
		expect(within(field).getAllByRole("listitem")).toHaveLength(3);
		expect(
			within(field).getByText("Grupo incluído: Recarga de veículo elétrico"),
		).toBeInTheDocument();
	});

	it("ignores a pair naming a version the project does not have", () => {
		renderPage("?de=2&para=9");

		expect(state.compared).toEqual([]);
		expect(screen.getByText("Projeto criado.")).toBeInTheDocument();
	});
});
