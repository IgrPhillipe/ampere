import { Badge } from "@components/ui/badge";
import { Skeleton } from "@components/ui/skeleton";
import {
	formatDate,
	formatKva,
	formatPlace,
	formatPostalCode,
} from "@features/shared";
import dayjs from "@lib/dayjs";
import { cn } from "@lib/utils";
import type { ProjectDetail } from "@services/projects";
import type { ReactNode } from "react";

import {
	projectStatusBadgeVariants,
	projectStatusLabels,
	projectVersion,
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

/** Same pattern as the listings: the date in mono, the distance in small muted text. */
const HeaderDate = ({ value }: { value: string }) => (
	<span className="flex flex-col gap-0.5">
		<time dateTime={value}>{formatDate(value)}</time>
		<span className="font-sans text-xs text-muted-foreground">
			{dayjs(value).fromNow()}
		</span>
	</span>
);

interface ProjectDetailHeaderProps {
	project?: ProjectDetail;
	isLoading?: boolean;
	units?: string;
	demandKva?: number | null;
	reanalysis?: boolean;
	/** The designer sees the version a rejected project is being corrected into. */
	correcting?: boolean;
	className?: string;
}

export const ProjectDetailHeader = ({
	project,
	isLoading = false,
	units,
	demandKva,
	reanalysis = false,
	correcting = false,
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
					<span className="text-sm text-muted-foreground">
						{project.address},{" "}
						{formatPlace(project.municipality, project.state)}
						{project.postalCode
							? `, CEP ${formatPostalCode(project.postalCode)}`
							: null}
					</span>
				</div>
			) : null}
		</div>

		<dl className="grid grid-cols-2 gap-px border-t border-border bg-border lg:grid-cols-7">
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

			<HeaderCell isLoading={isLoading} label="Versão">
				{project
					? correcting
						? `${projectVersion(project)}, em correção`
						: String(project.reviewCycle)
					: undefined}
			</HeaderCell>

			<HeaderCell isLoading={isLoading} label="Criado em">
				{project ? <HeaderDate value={project.createdAt} /> : undefined}
			</HeaderCell>

			<HeaderCell isLoading={isLoading} label="Enviado em">
				{project?.submittedAt ? (
					<HeaderDate value={project.submittedAt} />
				) : undefined}
			</HeaderCell>
		</dl>
	</header>
);
