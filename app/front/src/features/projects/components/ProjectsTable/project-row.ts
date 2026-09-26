import type { Project } from "@services/projects";

/** Reprovado com pendencia oferece "Ver Apontamentos". */
export const isRejectedWithFindings = (project: Project) =>
	project.status === "REJECTED" && project.pendingCount > 0;

/** Linha com acao ganha a marca lateral, na tabela e no cartao. */
export const hasProjectAction = (project: Project) =>
	project.status === "AWAITING_SUBMISSION" || isRejectedWithFindings(project);

/**
 * Objeto, nao dois parametros posicionais: os dois callbacks tem a mesma
 * assinatura, entao trocar a ordem compilava e quebrava em silencio — "Ver
 * apontamentos" abriria a retomada de envio.
 */
export interface ProjectRowActions {
	onViewFindings: (project: Project) => void;
	onResumeSubmission: (project: Project) => void;
}
