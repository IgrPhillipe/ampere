import { formatKva } from "@features/shared";
import dayjs from "@lib/dayjs";
import { cn } from "@lib/utils";
import type { Project } from "@services/projects";

import { ProjectStatusSummary } from "./ProjectStatusSummary";
import { hasProjectAction, type ProjectRowActions } from "./project-row";

interface ProjectCardsProps extends ProjectRowActions {
	projects: Project[];
	className?: string;
}

/**
 * A mesma listagem em largura estreita.
 *
 * Quatro colunas nao cabem num celular: ou a tabela rola de lado e nada e
 * legivel sem arrastar, ou as colunas se espremem. Aqui cada projeto vira um
 * bloco, na mesma ordem de leitura da tabela.
 */
export const ProjectCards = ({
	projects,
	onViewFindings,
	onResumeSubmission,
	className,
}: ProjectCardsProps) => (
	<ul className={cn("flex flex-col bg-card", className)}>
		{projects.map((project) => (
			<li
				key={project.id}
				className={cn(
					"relative flex flex-col gap-3 border-b border-border px-6 py-4 last:border-b-0",
					hasProjectAction(project) &&
						"before:absolute before:top-4 before:left-0 before:h-6 before:w-0.5 before:bg-brand-sunset",
				)}
			>
				<div className="flex flex-col gap-1">
					<span className="font-semibold text-foreground">{project.name}</span>

					<span className="text-xs text-muted-foreground">
						{project.address}, {project.municipality}
					</span>

					<span className="font-mono text-xs text-muted-foreground">
						Protocolo {project.protocol}
					</span>
				</div>

				<ProjectStatusSummary
					project={project}
					onViewFindings={onViewFindings}
					onResumeSubmission={onResumeSubmission}
				/>

				<dl className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
					<div className="flex gap-1.5">
						<dt>UCs</dt>
						<dd className="font-mono">{project.consumerUnitsCount}</dd>
					</div>

					<div className="flex gap-1.5">
						<dt>Demanda</dt>
						<dd className="font-mono">
							{project.demandKva === null
								? "Sem cálculo"
								: formatKva(project.demandKva, 1)}
						</dd>
					</div>

					<div className="flex gap-1.5">
						<dt>Criado em</dt>
						<dd>
							<time dateTime={project.createdAt} className="font-mono">
								{dayjs(project.createdAt).format("DD.MM.YYYY")}
							</time>
						</dd>
					</div>

					<div className="flex gap-1.5">
						<dt>Atualizado</dt>
						<dd>
							<time
								dateTime={project.updatedAt}
								title={dayjs(project.updatedAt).format("DD/MM/YYYY HH:mm")}
							>
								{dayjs(project.updatedAt).fromNow()}
							</time>
						</dd>
					</div>
				</dl>
			</li>
		))}
	</ul>
);
