import { http } from "@lib/http";

import { ReviewerDistributionEndpoints as e } from "./endpoints";
import {
	reviewerDistributionListResponseSchema,
	reviewerMunicipalityListResponseSchema,
} from "./schemas";
import type {
	AssignReviewQueuePayload,
	UpdateReviewerMunicipalitiesParams,
} from "./types";

export const getReviewerDistribution = async () => {
	const response = await http.get(e.list).json<unknown>();

	return reviewerDistributionListResponseSchema.parse(response);
};

export const updateReviewerMunicipalities = async ({
	reviewerId,
	municipalities,
}: UpdateReviewerMunicipalitiesParams) => {
	const response = await http
		.put(e.municipalities(reviewerId), { json: { municipalities } })
		.json<unknown>();

	return reviewerMunicipalityListResponseSchema.parse(response);
};

/** All or nothing: when one project fails, none of them changes. Answers 204. */
export const assignReviewQueue = async (payload: AssignReviewQueuePayload) => {
	await http.put(e.assignment, { json: payload });
};
