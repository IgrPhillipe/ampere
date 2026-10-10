import { formatDate, formatKva } from "@features/shared";
import dayjs from "@lib/dayjs";
import { cn } from "@lib/utils";
import type { Project } from "@services/projects";

import { PendingFindingsBadge } from "./PendingFindingsBadge";
import { ProjectActionIndicator } from "./ProjectActionIndicator";
import { ProjectRowActionButton } from "./ProjectRowActionButton";
import { ProjectStatusBadge } from "./ProjectStatusBadge";
import type { ProjectRowActions } from "./project-row";

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
	className,
	...actions
}: ProjectCardsProps) => (
	<ul className={cn("flex flex-col bg-card", className)}>
		{projects.map((project) => (
			<li
				key={project.id}
				className="flex flex-col gap-3 border-b border-border px-6 py-4 last:border-b-0"
			>
				<div className="flex flex-col gap-1">
					<div className="flex items-start justify-between gap-3">
						<span className="font-semibold text-foreground">
							{project.name}
						</span>
						<ProjectActionIndicator project={project} />
					</div>

					<span className="text-xs text-muted-foreground">
						{project.address}, {project.municipality}
					</span>

					<span className="font-mono text-xs text-muted-foreground">
						Protocolo {project.protocol}
					</span>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<ProjectStatusBadge project={project} />
					{project.pendingCount > 0 ? (
						<PendingFindingsBadge count={project.pendingCount} />
					) : null}
				</div>

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
								{formatDate(project.createdAt)}
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

				<div className="flex justify-end">
					<ProjectRowActionButton
						project={project}
						{...actions}
						buttonClassName="w-32"
					/>
				</div>
			</li>
		))}
	</ul>
);
