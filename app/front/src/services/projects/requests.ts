import { toSearchParams } from "@features/shared";
import { http } from "@lib/http";

import { ProjectEndpoints as e } from "./endpoints";
import { projectListResponseSchema } from "./schemas";
import type { CreateProjectPayload, ListProjectsParams } from "./types";

export const getProjectList = async (params: ListProjectsParams = {}) => {
	const response = await http
		.get(e.list, { searchParams: toSearchParams({ ...params }) })
		.json<unknown>();

	return projectListResponseSchema.parse(response);
};

export const createProject = async (payload: CreateProjectPayload) =>
	http
		.post(e.create, {
			json: payload,
		})
		.json<unknown>();
