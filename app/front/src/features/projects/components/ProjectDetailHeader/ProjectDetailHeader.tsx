import { Badge } from "@components/ui/badge";
import { Skeleton } from "@components/ui/skeleton";
import { formatDateTime, formatKva } from "@features/shared";
import { cn } from "@lib/utils";
import type { ProjectDetail } from "@services/projects";
import type { ReactNode } from "react";

import {
	projectStatusBadgeVariants,
	projectStatusLabels,
} from "../../constants";

interface HeaderCellProps {
	label: string;
	isLoading: boolean;
	children?: ReactNode;
}

const HeaderCell = ({ label, isLoading, children }: HeaderCellProps) => (
	<div className="flex min-w-0 flex-col gap-1.5 bg-card px-6 py-4 last:col-span-2 md:px-8 lg:last:col-span-1">
		<dt className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
			{label}
		</dt>
		<dd className="font-mono text-sm break-words text-foreground">
			{children ??
				(isLoading ? <Skeleton className="h-5 w-32" /> : "Não informado")}
		</dd>
	</div>
);

interface ProjectDetailHeaderProps {
	project?: ProjectDetail;
	isLoading?: boolean;
	units?: string;
	demandKva?: number | null;
	reanalysis?: boolean;
	className?: string;
}

export const ProjectDetailHeader = ({
	project,
	isLoading = false,
	units,
	demandKva,
	reanalysis = false,
	className,
}: ProjectDetailHeaderProps) => (
	<header className={cn("flex flex-col border-b border-border", className)}>
		<div className="flex flex-col gap-3 px-6 pt-8 pb-6 md:px-8">
			{project ? (
				<p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
					Protocolo {project.protocol}
				</p>
			) : (
				<Skeleton className="h-4 w-40" />
			)}

			{project ? (
				<h1 className="font-heading text-3xl font-semibold tracking-tight">
					{project.name}
				</h1>
			) : (
				<Skeleton className="h-9 w-80 max-w-full" />
			)}

			{project ? (
				<div className="flex flex-wrap items-center gap-2">
					<Badge variant={projectStatusBadgeVariants[project.status]}>
						{projectStatusLabels[project.status]}
					</Badge>
					{reanalysis ? <Badge variant="tag">Reanálise</Badge> : null}
					{project.reviewCycle > 0 ? (
						<Badge variant="neutral">Versão {project.reviewCycle}</Badge>
					) : null}
					<span className="text-sm text-muted-foreground">
						{project.address}, {project.municipality}
					</span>
				</div>
			) : null}
		</div>

		<dl className="grid grid-cols-2 gap-px border-t border-border bg-border lg:grid-cols-5">
			<HeaderCell isLoading={isLoading} label="Projetista">
				{project?.ownerName ?? undefined}
			</HeaderCell>

			<HeaderCell isLoading={isLoading} label="Unidades">
				{units}
			</HeaderCell>

			<HeaderCell isLoading={isLoading} label="Demanda">
				{demandKva === undefined
					? undefined
					: demandKva === null
						? "Sem cálculo"
						: formatKva(demandKva, 1)}
			</HeaderCell>

			<HeaderCell isLoading={isLoading} label="Normas">
				{project
					? project.standards
							.map(({ name, revision }) => `${name} ${revision}`)
							.join(" e ")
					: undefined}
			</HeaderCell>

			<HeaderCell isLoading={isLoading} label="Recebido em">
				{project?.submittedAt ? (
					<time dateTime={project.submittedAt}>
						{formatDateTime(project.submittedAt)}
					</time>
				) : undefined}
			</HeaderCell>
		</dl>
	</header>
);
