import { http } from "@lib/http";

import { ProjectEventsEndpoints as e } from "./endpoints";
import {
	projectEventListResponseSchema,
	projectReworkResponseSchema,
} from "./schemas";
import type { ProjectEventListParams } from "./types";

export const getProjectEventList = async (
	projectId: string,
	{ direction = "DESC" }: ProjectEventListParams = {},
) => {
	const response = await http
		.get(e.events(projectId), { searchParams: { direction } })
		.json<unknown>();

	return projectEventListResponseSchema.parse(response);
};

export const getProjectRework = async (projectId: string) => {
	const response = await http.get(e.rework(projectId)).json<unknown>();

	return projectReworkResponseSchema.parse(response);
};
