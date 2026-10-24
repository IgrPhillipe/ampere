import { toSearchParams } from "@features/shared";
import { http } from "@lib/http";
import type { BrazilianState } from "@services/locations";

import { ProjectEndpoints as e } from "./endpoints";
import {
	municipalityListResponseSchema,
	projectDetailResponseSchema,
	projectListResponseSchema,
	projectStatusCountsResponseSchema,
	stateListResponseSchema,
} from "./schemas";
import type { CreateProjectPayload, ListProjectsParams } from "./types";

export const getProjectList = async (params: ListProjectsParams = {}) => {
	const response = await http
		.get(e.list, { searchParams: toSearchParams({ ...params }) })
		.json<unknown>();

	return projectListResponseSchema.parse(response);
};

export const getProjectStatusCounts = async () => {
	const response = await http.get(e.statusCounts).json<unknown>();

	return projectStatusCountsResponseSchema.parse(response);
};

export const getProjectStateList = async () => {
	const response = await http.get(e.states).json<unknown>();

	return stateListResponseSchema.parse(response);
};

export const getMunicipalityList = async (state?: BrazilianState) => {
	const response = await http
		.get(e.municipalities, { searchParams: state ? { state } : undefined })
		.json<unknown>();

	return municipalityListResponseSchema.parse(response);
};

export const getProject = async (id: string) => {
	const response = await http.get(e.detail(id)).json<unknown>();

	return projectDetailResponseSchema.parse(response);
};

export const createProject = async (payload: CreateProjectPayload) => {
	const response = await http.post(e.create, { json: payload }).json<unknown>();

	return projectDetailResponseSchema.parse(response);
};

export const updateProject = async ({
	id,
	payload,
}: {
	id: string;
	payload: CreateProjectPayload;
}) => {
	const response = await http
		.put(e.update(id), { json: payload })
		.json<unknown>();

	return projectDetailResponseSchema.parse(response);
};

export const deleteProject = async (id: string) => {
	await http.delete(e.remove(id));
};
