import type { Project } from "@services/projects";

import { projectStatusLabels } from "../../constants";
import { InlineActionButton } from "./InlineActionButton";
import { isRejectedWithFindings, type ProjectRowActions } from "./project-row";

interface ProjectStatusSummaryProps extends ProjectRowActions {
	project: Project;
}

/**
 * Situacao do projeto e a acao que ela oferece.
 *
 * Fica fora das colunas porque a mesma informacao aparece na tabela e no
 * cartao de largura estreita; duplicar significava uma pendencia contada de
 * dois jeitos assim que alguem mexesse num dos dois.
 */
export const ProjectStatusSummary = ({
	project,
	onViewFindings,
	onResumeSubmission,
}: ProjectStatusSummaryProps) => (
	<div className="flex flex-col items-start gap-1.5">
		<span className="font-mono text-xs tracking-[0.08em] text-balance text-foreground uppercase">
			{projectStatusLabels[project.status]}
			{isRejectedWithFindings(project) ? (
				<>
					{", "}
					{project.pendingCount}{" "}
					{project.pendingCount === 1 ? "pendência" : "pendências"}
				</>
			) : null}
		</span>

		{isRejectedWithFindings(project) ? (
			<InlineActionButton onClick={() => onViewFindings(project)}>
				Ver Apontamentos
			</InlineActionButton>
		) : project.status === "AWAITING_SUBMISSION" ? (
			<InlineActionButton onClick={() => onResumeSubmission(project)}>
				Retomar e Enviar
			</InlineActionButton>
		) : null}
	</div>
);
