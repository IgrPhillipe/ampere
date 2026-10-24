import {
	formatDateTime,
	formatKva,
	formatPlace,
	padCount,
} from "@features/shared";
import { cn } from "@lib/utils";
import type { Project } from "@services/projects";
import type { ReactNode } from "react";

import { ProjectActionIndicator } from "./ProjectActionIndicator";
import { ProjectRowActionButton } from "./ProjectRowActionButton";
import { ProjectStatusBadge } from "./ProjectStatusBadge";
import type { ProjectRowActions } from "./project-row";

interface ProjectCardsProps extends ProjectRowActions {
	projects: Project[];
	showOwner?: boolean;
	className?: string;
}

interface FigureProps {
	label: string;
	children: ReactNode;
}

const Figure = ({ label, children }: FigureProps) => (
	<div className="flex min-w-0 flex-col gap-1">
		<dt className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
			{label}
		</dt>
		<dd className="font-mono text-sm text-foreground">{children}</dd>
	</div>
);

/** The listing on a narrow screen: one block per project, with the table's columns as labels. */
export const ProjectCards = ({
	projects,
	showOwner = false,
	className,
	...actions
}: ProjectCardsProps) => (
	<ul className={cn("flex flex-col bg-card", className)}>
		{projects.map((project) => (
			<li
				key={project.id}
				className="flex flex-col gap-4 border-b border-border px-6 py-4 last:border-b-0"
			>
				<div className="flex flex-col gap-1">
					<div className="flex items-start justify-between gap-3">
						<span className="font-semibold text-foreground">
							{project.name}
						</span>
						<ProjectActionIndicator project={project} />
					</div>

					<span className="text-xs text-muted-foreground">
						{project.address},{" "}
						{formatPlace(project.municipality, project.state)}
					</span>

					<span className="font-mono text-xs text-muted-foreground">
						Protocolo {project.protocol}
					</span>
				</div>

				<ProjectStatusBadge project={project} />

				<div className="flex items-end justify-between gap-4">
					<dl className="grid flex-1 grid-cols-2 gap-x-6 gap-y-3">
						{showOwner ? (
							<Figure label="Projetista">
								<span className="font-sans">
									{project.ownerName ?? "Não informado"}
								</span>
							</Figure>
						) : null}

						{project.pendingCount > 0 ? (
							<Figure label="Pendências">
								{padCount(project.pendingCount)}
							</Figure>
						) : null}

						<Figure label="UCs">{project.consumerUnitsCount}</Figure>

						<Figure label="Demanda">
							{project.demandKva === null
								? "Sem cálculo"
								: formatKva(project.demandKva, 1)}
						</Figure>

						<Figure label="Criado em">
							<time dateTime={project.createdAt}>
								{formatDateTime(project.createdAt)}
							</time>
						</Figure>

						<Figure label="Atualizado">
							<time dateTime={project.updatedAt}>
								{formatDateTime(project.updatedAt)}
							</time>
						</Figure>
					</dl>

					<ProjectRowActionButton project={project} {...actions} />
				</div>
			</li>
		))}
	</ul>
);
