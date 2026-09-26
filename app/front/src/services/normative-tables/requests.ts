import { http } from "@lib/http";

import { NormativeTableEndpoints as e } from "./endpoints";
import {
	normativeTableCodeListResponseSchema,
	normativeTableListResponseSchema,
	normativeTableResponseSchema,
} from "./schemas";
import type { NormativeTablePayload } from "./types";

export const getNormativeTableCodes = async () => {
	const response = await http.get(e.codes).json<unknown>();

	return normativeTableCodeListResponseSchema.parse(response);
};

export const getNormativeTableList = async () => {
	const response = await http.get(e.list).json<unknown>();

	return normativeTableListResponseSchema.parse(response);
};

export const getNormativeTable = async (id: string) => {
	const response = await http.get(e.detail(id)).json<unknown>();

	return normativeTableResponseSchema.parse(response);
};

export const createNormativeTable = async (payload: NormativeTablePayload) => {
	const response = await http.post(e.create, { json: payload }).json<unknown>();

	return normativeTableResponseSchema.parse(response);
};

export interface UpdateNormativeTableParams {
	id: string;
	payload: NormativeTablePayload;
}

export const updateNormativeTable = async ({
	id,
	payload,
}: UpdateNormativeTableParams) => {
	const response = await http
		.put(e.detail(id), { json: payload })
		.json<unknown>();

	return normativeTableResponseSchema.parse(response);
};

export const publishNormativeTable = async (id: string) => {
	const response = await http.post(e.publish(id)).json<unknown>();

	return normativeTableResponseSchema.parse(response);
};

export const deleteNormativeTable = async (id: string) => {
	await http.delete(e.detail(id));
};
