import { HttpResponse, http } from "msw";
import { z } from "zod";

import { ProjectEndpoints as e } from "../endpoints";
import {
	buildingCategorySchema,
	connectionTypeSchema,
	entranceStandardSchema,
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

		const filteredProjects = MOCK_PROJECTS.filter((project) => {
			if (parsedStatus?.success && project.status !== parsedStatus.data) {
				return false;
			}

			if (!search) return true;

			// Name and protocol, nothing else: it is what `GET /projects` promises to search.
			const searchableContent = [project.name, project.protocol]
				.map(normalize)
				.join(" ");

			return searchableContent.includes(search);
		});

		const start = (page - 1) * pageSize;
		const projects = filteredProjects.slice(start, start + pageSize);

		return HttpResponse.json(
			makeProjectList({
				projects,
				total: filteredProjects.length,
				page,
				pageSize,
			}),
		);
	}),

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
