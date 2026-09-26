import { MOCK_PROJECTS } from "@services/projects/mocks/fixtures";
import { HttpResponse, http } from "msw";
import { z } from "zod";

import { ConsumerUnitGroupEndpoints as e } from "../endpoints";
import {
	evStationTypeSchema,
	groupKindSchema,
	lampTechnologySchema,
	loadCategorySchema,
	loadUsageSchema,
	powerUnitSchema,
} from "../schemas";
import { makeGroup, makeGroupValidation } from "./factories";
import { MOCK_GROUPS } from "./fixtures";

const url = (path: string) => `/api/${path}`;

const problem = (status: number, title: string, detail: string) =>
	HttpResponse.json({ type: "about:blank", title, status, detail }, { status });

/**
 * Espelha o `ConsumerUnitGroupRequest` do back: so a forma do dado. Dado
 * normativo ausente passa, e volta como pendencia do grupo.
 */
const payloadSchema = z.object({
	kind: groupKindSchema,
	name: z.string().trim().min(1).max(120),
	quantity: z.number().int().min(1).max(10000),
	usefulArea: z.number().positive().nullish(),
	bedrooms: z.number().int().min(0).max(50).nullish(),
	unitLoadKw: z.number().positive().nullish(),
	compactUnit: z.boolean().nullish(),
	usage: loadUsageSchema.nullish(),
	items: z
		.array(
			z.object({
				category: loadCategorySchema,
				description: z.string().trim().min(1).max(120),
				quantity: z.number().int().min(1).max(10000),
				power: z.number().positive().nullish(),
				powerUnit: powerUnitSchema,
				lampTechnology: lampTechnologySchema.nullish(),
				simultaneousStart: z.boolean().nullish(),
			}),
		)
		.max(100)
		.nullish(),
	powerPerPointKw: z.number().positive().nullish(),
	incorporatedInVehicle: z.boolean().nullish(),
	loadManagement: z.boolean().nullish(),
	stationType: evStationTypeSchema.nullish(),
});

const projectOf = (projectId: string) =>
	MOCK_PROJECTS.find(({ id }) => id === projectId);

const groupsOf = (projectId: string) => {
	MOCK_GROUPS[projectId] ??= [];

	return MOCK_GROUPS[projectId];
};

const nextId = () =>
	String(
		Math.max(
			0,
			...Object.values(MOCK_GROUPS)
				.flat()
				.map(({ id }) => Number(id) || 0),
		) + 1,
	);

const notFound = () => problem(404, "Not Found", "Projeto não encontrado.");

const notDraft = () =>
	problem(
		409,
		"Conflict",
		"Só é possível alterar as unidades de um projeto em rascunho.",
	);

export const consumerUnitGroupHandlers = [
	// Antes de `:groupId`, que casaria com "validation".
	http.get(url(e.validation(":projectId")), ({ params }) => {
		const projectId = String(params.projectId);

		if (!projectOf(projectId)) return notFound();

		return HttpResponse.json({
			data: makeGroupValidation(groupsOf(projectId)),
		});
	}),

	http.get(url(e.list(":projectId")), ({ params }) => {
		const projectId = String(params.projectId);

		if (!projectOf(projectId)) return notFound();

		return HttpResponse.json({ data: groupsOf(projectId) });
	}),

	http.post(url(e.create(":projectId")), async ({ params, request }) => {
		const projectId = String(params.projectId);
		const project = projectOf(projectId);

		if (!project) return notFound();
		if (project.status !== "DRAFT") return notDraft();

		const payload = payloadSchema.safeParse(await request.json());

		if (!payload.success) {
			return problem(400, "Bad Request", "Verifique os dados enviados.");
		}

		const group = makeGroup(nextId(), payload.data);
		groupsOf(projectId).push(group);

		return HttpResponse.json({ data: group }, { status: 201 });
	}),

	http.put(
		url(e.detail(":projectId", ":groupId")),
		async ({ params, request }) => {
			const projectId = String(params.projectId);
			const project = projectOf(projectId);

			if (!project) return notFound();
			if (project.status !== "DRAFT") return notDraft();

			const groups = groupsOf(projectId);
			const index = groups.findIndex(({ id }) => id === params.groupId);

			if (index < 0) {
				return problem(404, "Not Found", "Grupo de unidades não encontrado.");
			}

			const payload = payloadSchema.safeParse(await request.json());

			if (!payload.success) {
				return problem(400, "Bad Request", "Verifique os dados enviados.");
			}

			if (payload.data.kind !== groups[index].kind) {
				return problem(
					409,
					"Conflict",
					"O tipo de um grupo não muda. Exclua o grupo e cadastre outro.",
				);
			}

			groups[index] = makeGroup(groups[index].id, payload.data);

			return HttpResponse.json({ data: groups[index] });
		},
	),

	http.delete(url(e.detail(":projectId", ":groupId")), ({ params }) => {
		const projectId = String(params.projectId);
		const project = projectOf(projectId);

		if (!project) return notFound();
		if (project.status !== "DRAFT") return notDraft();

		const groups = groupsOf(projectId);
		const index = groups.findIndex(({ id }) => id === params.groupId);

		if (index < 0) {
			return problem(404, "Not Found", "Grupo de unidades não encontrado.");
		}

		groups.splice(index, 1);

		return new HttpResponse(null, { status: 204 });
	}),
];
