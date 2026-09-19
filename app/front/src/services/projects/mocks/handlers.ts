import { HttpResponse, http } from "msw";

import { ProjectEndpoints as e } from "../endpoints";
import { projectStatusSchema } from "../schemas";
import { MOCK_PROJECT_UCS, MOCK_PROJECTS, makeProjectList } from "./factories";

const url = (path: string) => `/api/${path}`;

const normalize = (value: string) =>
	value
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.toLowerCase();

const problem = (detail: string) =>
	HttpResponse.json(
		{
			type: "about:blank",
			title: "Bad Request",
			status: 400,
			detail,
			instance: `/${e.list}`,
		},
		{ status: 400 },
	);

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

			const searchableContent = [
				project.name,
				project.protocol,
				...(MOCK_PROJECT_UCS[project.id] ?? []),
			]
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
];
