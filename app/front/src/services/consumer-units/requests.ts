import { http } from "@lib/http";

import { ConsumerUnitGroupEndpoints as e } from "./endpoints";
import {
	consumerUnitGroupListResponseSchema,
	consumerUnitGroupResponseSchema,
	groupValidationResponseSchema,
} from "./schemas";
import type { ConsumerUnitGroupPayload } from "./types";

export const getConsumerUnitGroupList = async (projectId: string) => {
	const response = await http.get(e.list(projectId)).json<unknown>();

	return consumerUnitGroupListResponseSchema.parse(response);
};

export const getConsumerUnitGroupValidation = async (projectId: string) => {
	const response = await http.get(e.validation(projectId)).json<unknown>();

	return groupValidationResponseSchema.parse(response);
};

export interface CreateConsumerUnitGroupParams {
	projectId: string;
	payload: ConsumerUnitGroupPayload;
}

export const createConsumerUnitGroup = async ({
	projectId,
	payload,
}: CreateConsumerUnitGroupParams) => {
	const response = await http
		.post(e.create(projectId), { json: payload })
		.json<unknown>();

	return consumerUnitGroupResponseSchema.parse(response);
};

export interface UpdateConsumerUnitGroupParams
	extends CreateConsumerUnitGroupParams {
	groupId: string;
}

export const updateConsumerUnitGroup = async ({
	projectId,
	groupId,
	payload,
}: UpdateConsumerUnitGroupParams) => {
	const response = await http
		.put(e.detail(projectId, groupId), { json: payload })
		.json<unknown>();

	return consumerUnitGroupResponseSchema.parse(response);
};

export interface DeleteConsumerUnitGroupParams {
	projectId: string;
	groupId: string;
}

export const deleteConsumerUnitGroup = async ({
	projectId,
	groupId,
}: DeleteConsumerUnitGroupParams) => {
	await http.delete(e.detail(projectId, groupId));
};
