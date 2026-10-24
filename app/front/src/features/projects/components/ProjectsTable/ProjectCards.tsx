import {
	formatDate,
	formatKva,
	formatPlace,
	formatTime,
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
	className?: string;
}

const Figure = ({ label, children, className }: FigureProps) => (
	<div className={cn("flex min-w-0 flex-col gap-1", className)}>
		<dt className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
			{label}
		</dt>
		<dd className="font-mono text-xs text-foreground">{children}</dd>
	</div>
);

const DateTime = ({ value }: { value: string }) => (
	<time dateTime={value} className="flex flex-col">
		<span>{formatDate(value)}</span>
		<span className="text-muted-foreground">{formatTime(value)}</span>
	</time>
);

const figuresOf = (project: Project, showOwner: boolean) => [
	...(showOwner
		? [
				{
					label: "Projetista",
					value: (
						<span className="font-sans">
							{project.ownerName ?? "Não informado"}
						</span>
					),
				},
			]
		: []),
	...(project.pendingCount > 0
		? [{ label: "Pendências", value: padCount(project.pendingCount) }]
		: []),
	{ label: "UCs", value: String(project.consumerUnitsCount) },
	{
		label: "Demanda",
		value: (
			<span className="whitespace-nowrap">
				{project.demandKva === null
					? "Sem cálculo"
					: formatKva(project.demandKva, 1)}
			</span>
		),
	},
	{ label: "Criado em", value: <DateTime value={project.createdAt} /> },
	{ label: "Atualizado", value: <DateTime value={project.updatedAt} /> },
];

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
				className="flex flex-col gap-4 border-b border-border py-4 last:border-b-0"
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

				<div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-start gap-x-3 gap-y-3">
					<dl className="contents">
						{figuresOf(project, showOwner).map((figure, index) => (
							<Figure
								key={figure.label}
								label={figure.label}
								className={index % 2 === 0 ? "col-start-1" : "col-start-2"}
							>
								{figure.value}
							</Figure>
						))}
					</dl>

					<div
						className="col-start-3 self-end justify-self-end"
						style={{
							gridRow: Math.ceil(figuresOf(project, showOwner).length / 2),
						}}
					>
						<ProjectRowActionButton project={project} {...actions} />
					</div>
				</div>
			</li>
		))}
	</ul>
);
