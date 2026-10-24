import type { DocumentType } from "@services/submission";

import type {
	FindingResolution,
	FindingSeverity,
	FindingStage,
	FindingStatus,
	ReviewDecision,
} from "./schemas";

export interface FindingPayload {
	severity: FindingSeverity;
	stage: FindingStage;
	consumerUnitGroupId: number | null;
	calculationStepCode: string | null;
	documentType: DocumentType | null;
	description: string;
	standardItem: string | null;
}

export interface CreateFindingParams {
	projectId: string;
	payload: FindingPayload;
}

export interface UpdateFindingParams extends CreateFindingParams {
	findingId: string;
}

export interface DeleteFindingParams {
	projectId: string;
	findingId: string;
}

export interface ResolveFindingParams extends DeleteFindingParams {
	resolution: FindingResolution;
}

export interface RespondFindingParams extends DeleteFindingParams {
	status: Extract<FindingStatus, "FIXED" | "CONTESTED">;
	response?: string;
}

export interface DecideProjectReviewParams {
	projectId: string;
	decision: ReviewDecision;
	opinion: string;
}

export interface DocumentFile {
	filename: string;
	blob: Blob;
}
