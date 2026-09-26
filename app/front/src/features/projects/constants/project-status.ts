import type { ProjectStatus, ProjectStatusCounts } from "@services/projects";

export const projectStatusLabels = {
	DRAFT: "Rascunho",
	AWAITING_SUBMISSION: "Aguardando Envio",
	UNDER_REVIEW: "Em Análise",
	REJECTED: "Reprovado",
	APPROVED: "Aprovado",
} as const satisfies Record<ProjectStatus, string>;

export const projectStatusCountKeys = {
	DRAFT: "draft",
	AWAITING_SUBMISSION: "awaitingSubmission",
	UNDER_REVIEW: "underReview",
	REJECTED: "rejected",
	APPROVED: "approved",
} as const satisfies Record<ProjectStatus, keyof ProjectStatusCounts>;
