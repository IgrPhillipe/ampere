import type { Project } from "@services/projects";

/** Reprovado com pendencia oferece "Ver Apontamentos". */
export const isRejectedWithFindings = (project: Project) =>
	project.status === "REJECTED" && project.pendingCount > 0;

/**
 * O que o projetista precisa fazer no projeto, ou `null` quando nada. Vira o
 * texto do indicador amarelo, na tabela e no cartao.
 */
export const getProjectActionLabel = (project: Project) => {
	if (isRejectedWithFindings(project)) return "Corrigir apontamentos";
	if (project.status === "AWAITING_SUBMISSION") return "Enviar projeto";
	return null;
};

/**
 * Objeto, nao dois parametros posicionais: os dois callbacks tem a mesma
 * assinatura, entao trocar a ordem compilava e quebrava em silencio — "Ver
 * apontamentos" abriria a retomada de envio.
 */
export interface ProjectRowActions {
	onViewFindings: (project: Project) => void;
	onResumeSubmission: (project: Project) => void;
}
