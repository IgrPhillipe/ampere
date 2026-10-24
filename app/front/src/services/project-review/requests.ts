import { http } from "@lib/http";

import { ProjectReviewEndpoints as e } from "./endpoints";
import {
	findingListResponseSchema,
	findingResponseSchema,
	reviewAssignmentResponseSchema,
	reviewDecisionResponseSchema,
} from "./schemas";
import type {
	CreateFindingParams,
	DecideProjectReviewParams,
	DeleteFindingParams,
	DocumentFile,
	ResolveFindingParams,
	RespondFindingParams,
	UpdateFindingParams,
} from "./types";

const FILENAME = /filename="?([^";]+)"?/;

export const assignProjectReview = async (projectId: string) => {
	const response = await http.post(e.assignment(projectId)).json<unknown>();

	return reviewAssignmentResponseSchema.parse(response);
};

export const getFindingList = async (projectId: string) => {
	const response = await http.get(e.findings(projectId)).json<unknown>();

	return findingListResponseSchema.parse(response);
};

export const createFinding = async ({
	projectId,
	payload,
}: CreateFindingParams) => {
	const response = await http
		.post(e.findings(projectId), { json: payload })
		.json<unknown>();

	return findingResponseSchema.parse(response);
};

export const updateFinding = async ({
	projectId,
	findingId,
	payload,
}: UpdateFindingParams) => {
	const response = await http
		.put(e.finding(projectId, findingId), { json: payload })
		.json<unknown>();

	return findingResponseSchema.parse(response);
};

export const deleteFinding = async ({
	projectId,
	findingId,
}: DeleteFindingParams) => {
	await http.delete(e.finding(projectId, findingId));
};

export const resolveFinding = async ({
	projectId,
	findingId,
	resolution,
}: ResolveFindingParams) => {
	const response = await http
		.post(e.resolution(projectId, findingId), { json: { resolution } })
		.json<unknown>();

	return findingResponseSchema.parse(response);
};

export const respondFinding = async ({
	projectId,
	findingId,
	status,
	response,
}: RespondFindingParams) => {
	const result = await http
		.put(e.response(projectId, findingId), { json: { status, response } })
		.json<unknown>();

	return findingResponseSchema.parse(result);
};

export const decideProjectReview = async ({
	projectId,
	decision,
	opinion,
}: DecideProjectReviewParams) => {
	const response = await http
		.post(e.decision(projectId), { json: { decision, opinion } })
		.json<unknown>();

	return reviewDecisionResponseSchema.parse(response);
};

export const getDocumentFile = async (
	projectId: string,
	documentId: string,
): Promise<DocumentFile> => {
	const response = await http.get(e.documentFile(projectId, documentId));
	const disposition = response.headers.get("Content-Disposition") ?? "";

	return {
		filename: FILENAME.exec(disposition)?.[1] ?? "documento.pdf",
		blob: new Blob([await response.blob()], { type: "application/pdf" }),
	};
};
