import type { BadgeProps } from "@components/ui/badge";
import type { ProjectStatus, ProjectStatusCounts } from "@services/projects";

export const projectStatusLabels = {
	DRAFT: "Rascunho",
	AWAITING_SUBMISSION: "Aguardando Envio",
	UNDER_REVIEW: "Em Análise",
	REJECTED: "Reprovado",
	APPROVED: "Aprovado",
	EXPIRED: "Expirado",
} as const satisfies Record<ProjectStatus, string>;

export const projectStatusCountKeys = {
	DRAFT: "draft",
	AWAITING_SUBMISSION: "awaitingSubmission",
	UNDER_REVIEW: "underReview",
	REJECTED: "rejected",
	APPROVED: "approved",
	EXPIRED: "expired",
} as const satisfies Record<ProjectStatus, keyof ProjectStatusCounts>;

export const projectStatusBadgeVariants = {
	DRAFT: "neutral",
	AWAITING_SUBMISSION: "warning",
	UNDER_REVIEW: "info",
	REJECTED: "destructive",
	APPROVED: "success",
	EXPIRED: "neutral",
} as const satisfies Record<ProjectStatus, BadgeProps["variant"]>;
