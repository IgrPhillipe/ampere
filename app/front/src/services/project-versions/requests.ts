import { http } from "@lib/http";

import { ProjectVersionEndpoints as e } from "./endpoints";
import {
	memorialVerificationResponseSchema,
	projectVersionListResponseSchema,
} from "./schemas";

export const getProjectVersionList = async (projectId: string) => {
	const response = await http.get(e.list(projectId)).json<unknown>();

	return projectVersionListResponseSchema.parse(response);
};

export const verifyMemorialByCode = async (code: string) => {
	const response = await http.get(e.verifyCode(code)).json<unknown>();

	return memorialVerificationResponseSchema.parse(response);
};

export const verifyMemorialByFile = async (file: File) => {
	const body = new FormData();
	body.append("file", file);
	const response = await http.post(e.verifyFile, { body }).json<unknown>();

	return memorialVerificationResponseSchema.parse(response);
};
