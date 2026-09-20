import type { ProjectStatus, ProjectStatusCounts } from "@services/projects";

/**
 * Rotulo de cada situacao, num lugar so. A tabela e a barra de filtros
 * mostravam os mesmos textos a partir de duas listas separadas; acrescentar uma
 * sexta situacao exigia lembrar das duas.
 *
 * `satisfies Record<ProjectStatus, ...>` e o que cobra exaustividade: situacao
 * nova no enum quebra aqui, em vez de aparecer sem rotulo na tela.
 */
export const projectStatusLabels = {
	DRAFT: "Rascunho",
	AWAITING_SUBMISSION: "Aguardando envio",
	UNDER_REVIEW: "Em análise",
	REJECTED: "Reprovado",
	APPROVED: "Aprovado",
} as const satisfies Record<ProjectStatus, string>;

/** Campo dos contadores que corresponde a cada situacao. */
export const projectStatusCountKeys = {
	DRAFT: "draft",
	AWAITING_SUBMISSION: "awaitingSubmission",
	UNDER_REVIEW: "underReview",
	REJECTED: "rejected",
	APPROVED: "approved",
} as const satisfies Record<ProjectStatus, keyof ProjectStatusCounts>;
