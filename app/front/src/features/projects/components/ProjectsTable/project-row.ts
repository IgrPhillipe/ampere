import type { AttentionMessage } from "@components/AttentionIndicator";
import type { Project } from "@services/projects";

export const getProjectAttention = (
	project: Project,
): AttentionMessage | null => {
	if (project.status === "REJECTED") {
		const count = project.pendingCount;

		return {
			severity: "critical",
			title: "Projeto reprovado",
			details:
				count > 0
					? [
							`${count} ${count === 1 ? "apontamento" : "apontamentos"} a corrigir`,
						]
					: [],
			action: "Corrija os apontamentos e reenvie para análise.",
		};
	}

	if (project.status === "AWAITING_SUBMISSION") {
		return {
			severity: "warning",
			title: "Envio pendente",
			details: ["Cálculo concluído, mas o projeto ainda não foi enviado"],
			action: "Revise o memorial e envie para análise.",
		};
	}

	return null;
};

/** An object, not positional callbacks: they share a signature, so a swap would compile. */
export interface ProjectRowActions {
	onViewFindings: (project: Project) => void;
	onResumeSubmission: (project: Project) => void;
	onContinueDraft: (project: Project) => void;
	onViewProject: (project: Project) => void;
	onDeleteProject: (project: Project) => void;
}

interface ProjectRowAction {
	label: string;
	/** Filled when the row waits on the designer, outlined when it is only a lookup. */
	required: boolean;
	run: (actions: ProjectRowActions, project: Project) => void;
}

export const getProjectRowAction = (project: Project): ProjectRowAction => {
	if (project.status === "REJECTED") {
		return {
			label: "Corrigir",
			required: true,
			run: (actions) => actions.onViewFindings(project),
		};
	}

	if (project.status === "AWAITING_SUBMISSION") {
		return {
			label: "Enviar",
			required: true,
			run: (actions) => actions.onResumeSubmission(project),
		};
	}

	if (project.status === "DRAFT") {
		return {
			label: "Continuar",
			required: true,
			run: (actions) => actions.onContinueDraft(project),
		};
	}

	return {
		label: "Ver Projeto",
		required: false,
		run: (actions) => actions.onViewProject(project),
	};
};
