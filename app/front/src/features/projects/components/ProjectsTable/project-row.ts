import type { TooltipMessage } from "@components/ui/tooltip";
import type { Project } from "@services/projects";

/** Reprovado com pendencia oferece "Ver Apontamentos". */
export const isRejectedWithFindings = (project: Project) =>
	project.status === "REJECTED" && project.pendingCount > 0;

export const getProjectAttention = (
	project: Project,
): TooltipMessage | null => {
	if (isRejectedWithFindings(project)) {
		const count = project.pendingCount;

		return {
			title: "Projeto reprovado",
			details: [
				`${count} ${count === 1 ? "apontamento" : "apontamentos"} do analista a corrigir`,
			],
			action: "Corrija os apontamentos e reenvie para análise.",
		};
	}

	if (project.status === "AWAITING_SUBMISSION") {
		return {
			title: "Envio pendente",
			details: ["Cálculo concluído, mas o projeto ainda não foi enviado"],
			action: "Revise o memorial e envie para análise.",
		};
	}

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
