import { sortDirectionSchema } from "@features/shared";
import dayjs from "@lib/dayjs";
import { HttpResponse, http } from "msw";
import { z } from "zod";

import { ProjectEndpoints as e } from "../endpoints";
import {
	buildingCategorySchema,
	connectionTypeSchema,
	entranceStandardSchema,
	type Project,
	type ProjectSort,
	projectSortSchema,
	projectStatusSchema,
	supplyVoltageSchema,
} from "../schemas";
import {
	makeCreatedProjectResponse,
	makeProjectList,
	makeProjectStatusCountsResponse,
} from "./factories";
import { MOCK_PROJECTS } from "./fixtures";

const url = (path: string) => `/api/${path}`;

const normalize = (value: string) =>
	value
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.toLowerCase();

const problem = (detail: string, instance: string = e.list) =>
	HttpResponse.json(
		{
			type: "about:blank",
			title: "Bad Request",
			status: 400,
			detail,
			instance: `/${instance}`,
		},
		{ status: 400 },
	);

const isIsoDate = (value: string) => dayjs(value, "YYYY-MM-DD", true).isValid();

const sortValue: Record<ProjectSort, (project: Project) => number | string> = {
	name: (project) => normalize(project.name),
	demand: (project) => project.demandKva ?? -1,
	createdAt: (project) => project.createdAt,
	updatedAt: (project) => project.updatedAt,
};

/** The mock has no findings: a rejected project with pending items stands in for an open blocking one. */
const hasBlockingFinding = (project: Project) =>
	project.status === "REJECTED" && project.pendingCount > 0;

/**
 * Espelha o `ProjectRequest` do back, limites e mensagens inclusive. O mock so
 * vale como andaime se recusar o que a API recusaria.
 */
const createProjectSchema = z.object({
	name: z.string().trim().min(1).max(120),
	address: z.string().trim().min(1).max(200),
	municipality: z.string().trim().min(1).max(100),
	buildingType: buildingCategorySchema,
	floors: z.number().int().min(1).max(200),
	voltage: supplyVoltageSchema,
	connectionType: connectionTypeSchema,
	entranceStandard: entranceStandardSchema,
});

export const projectHandlers = [
	http.get(url(e.list), ({ request }) => {
		const searchParams = new URL(request.url).searchParams;
		const page = Number(searchParams.get("page") ?? 1);
		const pageSize = Number(searchParams.get("pageSize") ?? 20);
		const rawStatus = searchParams.get("status");
		const search = normalize(searchParams.get("search")?.trim() ?? "");

		if (!Number.isInteger(page) || page < 1) {
			return problem("A página deve ser maior ou igual a 1.");
		}

		if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
			return problem("O tamanho da página deve estar entre 1 e 100.");
		}

		const parsedStatus = rawStatus
			? projectStatusSchema.safeParse(rawStatus.toUpperCase())
			: null;

		if (parsedStatus && !parsedStatus.success) {
			return problem("Status de projeto inválido.");
		}

		const sort = projectSortSchema.safeParse(
			searchParams.get("sort") ?? "updatedAt",
		);
		const direction = sortDirectionSchema.safeParse(
			searchParams.get("direction") ?? "DESC",
		);

		if (!sort.success) return problem("Ordenação inválida.");
		if (!direction.success) return problem("Direção de ordenação inválida.");

		const municipality = searchParams.get("municipality")?.trim();
		const createdFrom = searchParams.get("createdFrom");
		const createdTo = searchParams.get("createdTo");

		if (
			(createdFrom && !isIsoDate(createdFrom)) ||
			(createdTo && !isIsoDate(createdTo))
		) {
			return problem("Data inválida. Use o formato AAAA-MM-DD.");
		}

		if (createdFrom && createdTo && createdFrom > createdTo) {
			return problem("A data inicial deve ser anterior ou igual à data final.");
		}

		const hasBlocking = searchParams.get("hasBlocking") === "true";

		const filteredProjects = MOCK_PROJECTS.filter((project) => {
			if (parsedStatus?.success && project.status !== parsedStatus.data) {
				return false;
			}

			if (
				municipality &&
				project.municipality.toLowerCase() !== municipality.toLowerCase()
			) {
				return false;
			}

			const createdOn = project.createdAt.slice(0, 10);

			if (createdFrom && createdOn < createdFrom) return false;
			if (createdTo && createdOn > createdTo) return false;
			if (hasBlocking && !hasBlockingFinding(project)) return false;

			if (!search) return true;

			// Name and protocol, nothing else: it is what `GET /projects` promises to search.
			const searchableContent = [project.name, project.protocol]
				.map(normalize)
				.join(" ");

			return searchableContent.includes(search);
		});

		const value = sortValue[sort.data];
		const sign = direction.data === "ASC" ? 1 : -1;
		const sortedProjects = filteredProjects.toSorted((a, b) => {
			const left = value(a);
			const right = value(b);

			return left === right ? 0 : left < right ? -sign : sign;
		});

		const start = (page - 1) * pageSize;
		const projects = sortedProjects.slice(start, start + pageSize);

		return HttpResponse.json(
			makeProjectList({
				projects,
				total: filteredProjects.length,
				page,
				pageSize,
			}),
		);
	}),

	http.get(url(e.municipalities), () =>
		HttpResponse.json({
			data: [
				...new Set(MOCK_PROJECTS.map((project) => project.municipality)),
			].toSorted((a, b) => a.localeCompare(b, "pt-BR")),
		}),
	),

	http.get(url(e.statusCounts), () =>
		HttpResponse.json(makeProjectStatusCountsResponse()),
	),

	http.post(url(e.create), async ({ request }) => {
		const payload = createProjectSchema.safeParse(await request.json());

		if (!payload.success) {
			return problem("Dados da edificação inválidos.", e.create);
		}

		return HttpResponse.json(makeCreatedProjectResponse(payload.data), {
			status: 201,
		});
	}),
];
