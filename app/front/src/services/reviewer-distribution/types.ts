import type { ReviewerMunicipality } from "./schemas";

export interface UpdateReviewerMunicipalitiesParams {
	reviewerId: string;
	/** Replaces the whole list of the analyst. */
	municipalities: ReviewerMunicipality[];
}

export interface AssignReviewQueuePayload {
	projectIds: string[];
	reviewerId: string;
}
