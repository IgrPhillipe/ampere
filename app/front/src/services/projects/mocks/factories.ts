import type {
	Project,
	ProjectDetail,
	ProjectDetailResponse,
	ProjectListResponse,
	ProjectStatusCounts,
	ProjectStatusCountsResponse,
} from "../schemas";
import type { CreateProjectPayload } from "../types";
import { MOCK_PROJECTS } from "./fixtures";

export const makeProject = (overrides?: Partial<Project>): Project => ({
	...MOCK_PROJECTS[0],
	...overrides,
});

export const makeProjectStatusCounts = (
	projects: Project[] = MOCK_PROJECTS,
): ProjectStatusCounts => ({
	total: projects.length,
	draft: projects.filter(({ status }) => status === "DRAFT").length,
	awaitingSubmission: projects.filter(
		({ status }) => status === "AWAITING_SUBMISSION",
	).length,
	underReview: projects.filter(({ status }) => status === "UNDER_REVIEW")
		.length,
	rejected: projects.filter(({ status }) => status === "REJECTED").length,
	approved: projects.filter(({ status }) => status === "APPROVED").length,
});

interface MakeProjectListOptions {
	projects?: Project[];
	total?: number;
	page?: number;
	pageSize?: number;
}

export const makeProjectList = ({
	projects = MOCK_PROJECTS,
	total = projects.length,
	page = 1,
	pageSize = 20,
}: MakeProjectListOptions = {}): ProjectListResponse => ({
	data: projects,
	pagination: { total, page, pageSize },
});

export const makeProjectStatusCountsResponse = (
	projects: Project[] = MOCK_PROJECTS,
): ProjectStatusCountsResponse => ({
	data: makeProjectStatusCounts(projects),
});

/**
 * Normas do seed do back (`DataSeeder`), na ordem em que os documentos se
 * citam. O mock nao reimplementa a derivacao por tipo de edificacao: devolve
 * as duas, que e o caso de todas as categorias entregues ate aqui.
 */
const MOCK_STANDARDS = [
	{ name: "DIS-NOR-053", revision: "REV 06" },
	{ name: "DIS-NOR-030", revision: "REV 07" },
];

/**
 * Projeto recem-criado, no formato de `POST /projects`.
 *
 * Empurra para `MOCK_PROJECTS` de proposito: sem isso a listagem e os
 * contadores ficariam iguais depois de criar, e o caminho de invalidacao de
 * cache nao teria como ser exercitado em desenvolvimento.
 */
export const makeCreatedProject = (
	payload: CreateProjectPayload,
): ProjectDetail => {
	const now = new Date().toISOString();
	const id = String(
		Math.max(0, ...MOCK_PROJECTS.map(({ id }) => Number(id) || 0)) + 1,
	);

	MOCK_PROJECTS.unshift({
		id,
		name: payload.name,
		address: payload.address,
		municipality: payload.municipality,
		protocol: `2026-${id.padStart(4, "0")}`,
		status: "DRAFT",
		createdAt: now,
		updatedAt: now,
		pendingCount: 0,
	});

	return {
		id,
		name: payload.name,
		address: payload.address,
		municipality: payload.municipality,
		protocol: `2026-${id.padStart(4, "0")}`,
		status: "DRAFT",
		createdAt: now,
		updatedAt: now,
		buildingType: payload.buildingType,
		floors: payload.floors,
		voltage: payload.voltage,
		connectionType: payload.connectionType,
		entranceStandard: payload.entranceStandard,
		standards: MOCK_STANDARDS,
		applicableStandards: MOCK_STANDARDS.map(
			({ name, revision }) => `${name} ${revision}`,
		).join(" e "),
		demandRules: [],
	};
};

export const makeCreatedProjectResponse = (
	payload: CreateProjectPayload,
): ProjectDetailResponse => ({ data: makeCreatedProject(payload) });
