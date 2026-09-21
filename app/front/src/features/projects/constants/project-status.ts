import type { ProjectStatus, ProjectStatusCounts } from "@services/projects";

/** Label of each status, in one place. */
export const projectStatusLabels = {
	DRAFT: "Rascunho",
	AWAITING_SUBMISSION: "Aguardando envio",
	UNDER_REVIEW: "Em análise",
	REJECTED: "Reprovado",
	APPROVED: "Aprovado",
} as const satisfies Record<ProjectStatus, string>;

/** Counter field matching each status. */
export const projectStatusCountKeys = {
	DRAFT: "draft",
	AWAITING_SUBMISSION: "awaitingSubmission",
	UNDER_REVIEW: "underReview",
	REJECTED: "rejected",
	APPROVED: "approved",
} as const satisfies Record<ProjectStatus, keyof ProjectStatusCounts>;
