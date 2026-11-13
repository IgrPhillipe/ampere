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
	VersionFile,
	VersionFileParams,
} from "./types";

export const getProjectVersionList = async (projectId: string) => {
	const response = await http.get(e.list(projectId)).json<unknown>();

	return projectVersionListResponseSchema.parse(response);
};

const fileOf = (projectId: string, version: number, file: VersionFile) => {
	switch (file.kind) {
		case "memorial":
			return {
				url: e.memorial(projectId, version),
				fallback: `memorial-v${version}.pdf`,
			};
		case "approval-memorial":
			return {
				url: e.approvalMemorial(projectId, version),
				fallback: `memorial-aprovacao-v${version}.pdf`,
			};
		case "document":
			return {
				url: e.document(projectId, version, file.type),
				fallback: `documento-v${version}.pdf`,
			};
	}
};

/** A PDF stored in the version, never generated again. */
export const getVersionFile = async ({
	projectId,
	version,
	file,
}: VersionFileParams): Promise<Memorial> => {
	const { url, fallback } = fileOf(projectId, version, file);
	const response = await http.get(url);

	return {
		filename: filenameOf(response, fallback),
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
