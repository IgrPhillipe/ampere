import { filenameOf, http } from "@lib/http";
import type { Memorial } from "@services/submission";

import { ProjectVersionEndpoints as e } from "./endpoints";
import {
	memorialVerificationResponseSchema,
	projectVersionListResponseSchema,
	versionComparisonResponseSchema,
} from "./schemas";
import type {
	CompareProjectVersionsParams,
	VersionMemorialParams,
} from "./types";

export const getProjectVersionList = async (projectId: string) => {
	const response = await http.get(e.list(projectId)).json<unknown>();

	return projectVersionListResponseSchema.parse(response);
};

/** The PDF stored in the version, never generated again. */
export const getVersionMemorial = async ({
	projectId,
	version,
}: VersionMemorialParams): Promise<Memorial> => {
	const response = await http.get(e.memorial(projectId, version));

	return {
		filename: filenameOf(response, `memorial-v${version}.pdf`),
		blob: await response.blob(),
	};
};

export const compareProjectVersions = async ({
	projectId,
	from,
	to,
}: CompareProjectVersionsParams) => {
	const response = await http
		.get(e.compare(projectId), { searchParams: { from, to } })
		.json<unknown>();

	return versionComparisonResponseSchema.parse(response);
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
