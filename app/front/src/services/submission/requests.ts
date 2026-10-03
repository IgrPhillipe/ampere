import { http } from "@lib/http";

import { SubmissionEndpoints as e } from "./endpoints";
import {
	projectDocumentResponseSchema,
	submissionChecklistResponseSchema,
	submitProjectResponseSchema,
} from "./schemas";
import type {
	DeleteDocumentParams,
	Memorial,
	UploadDocumentParams,
} from "./types";

const FILENAME = /filename="?([^";]+)"?/;

export const getSubmissionChecklist = async (projectId: string) => {
	const response = await http.get(e.submission(projectId)).json<unknown>();

	return submissionChecklistResponseSchema.parse(response);
};

export const getMemorial = async (projectId: string): Promise<Memorial> => {
	const response = await http.get(e.memorial(projectId));
	const disposition = response.headers.get("Content-Disposition") ?? "";

	return {
		filename: FILENAME.exec(disposition)?.[1] ?? "memorial.pdf",
		blob: await response.blob(),
	};
};

export const uploadDocument = async ({
	projectId,
	type,
	file,
}: UploadDocumentParams) => {
	const body = new FormData();
	body.append("type", type);
	body.append("file", file);
	const response = await http
		.post(e.documents(projectId), { body })
		.json<unknown>();

	return projectDocumentResponseSchema.parse(response);
};

export const deleteDocument = async ({
	projectId,
	documentId,
}: DeleteDocumentParams) => {
	await http.delete(e.document(projectId, documentId));
};

export const submitProject = async (projectId: string) => {
	const response = await http.post(e.submit(projectId)).json<unknown>();

	return submitProjectResponseSchema.parse(response);
};
