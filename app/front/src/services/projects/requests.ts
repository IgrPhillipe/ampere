import { toSearchParams } from "@features/shared";
import { http } from "@lib/http";

import { ProjectEndpoints as e } from "./endpoints";
import {
	projectDetailResponseSchema,
	projectListResponseSchema,
	projectStatusCountsResponseSchema,
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

export const submitProject = async (id: string) => {
	const response = await http.post(e.submit(id)).json<unknown>();
	return response;
};

export const uploadDocument = async ({
	id,
	docType,
	file,
}: {
	id: string;
	docType: string;
	file: File;
}) => {
	const formData = new FormData();
	formData.append("file", file);
	const response = await http
		.post(e.uploadDocument(id, docType), { body: formData })
		.json<unknown>();
	return response;
};
