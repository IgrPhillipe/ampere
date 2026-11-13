import {
	DeadlineStatusBadge,
	describeDeadline,
} from "@components/DeadlineStatusBadge";
import { Skeleton } from "@components/ui/skeleton";
import {
	formatDate,
	formatKva,
	formatPostalCode,
	padCount,
} from "@features/shared";
import { cn } from "@lib/utils";
import type { ProjectDetail } from "@services/projects";
import type { ReactNode } from "react";

import {
	projectStatusLabels,
	projectVersion,
	wasApproved,
} from "../../constants";

interface StripCellProps {
	label: string;
	isLoading: boolean;
	/** Full text for a value cut to fit the strip. */
	title?: string;
	className?: string;
	children?: ReactNode;
}

/** A cell of the Figma "ficha": versalete label over a mono value, split by a short rule. */
const StripCell = ({
	label,
	isLoading,
	title,
	className,
	children,
}: StripCellProps) => (
	<div
		className={cn(
			"relative flex min-w-0 flex-auto flex-col gap-1.5 pr-4 not-first:pl-4 not-first:before:absolute not-first:before:top-0.5 not-first:before:bottom-0.5 not-first:before:left-0 not-first:before:w-px not-first:before:bg-border",
			className,
		)}
	>
		<dt className="truncate font-mono text-2xs tracking-[0.11em] text-faint-foreground uppercase">
			{label}
		</dt>
		<dd title={title} className="truncate font-mono text-sm text-foreground">
			{children ??
				(isLoading ? <Skeleton className="h-5 w-24" /> : "Não informado")}
		</dd>
	</div>
);

const StripDate = ({ value }: { value: string }) => (
	<time dateTime={value}>{formatDate(value)}</time>
);

export interface HeaderMetric {
	label: string;
	value?: ReactNode;
}

/** The date that matters most for where the project stands. */
const milestoneOf = (project: ProjectDetail, reviewing: boolean) => {
	if (reviewing && project.submittedAt)
		return { label: "Recebido em", value: project.submittedAt };
	if (project.status === "REJECTED" && project.reviewedAt)
		return { label: "Devolvido em", value: project.reviewedAt };
	if (wasApproved(project.status) && project.reviewedAt)
		return { label: "Aprovado em", value: project.reviewedAt };

	return { label: "Última movimentação", value: project.lastActivityAt };
};

/** The whole deadline for a cell cut to fit the strip. */
const deadlineTitleOf = ({
	reviewDeadline,
	deadlineStatus,
	daysRemaining,
}: ProjectDetail) => {
	if (!reviewDeadline) return undefined;
	if (!deadlineStatus || daysRemaining == null)
		return formatDate(reviewDeadline);

	return `${formatDate(reviewDeadline)}, ${describeDeadline(deadlineStatus, daysRemaining, { withRemaining: true })}`;
};

const addressOf = (project: ProjectDetail) =>
	[
		project.address,
		`${project.municipality}/${project.state}`,
		project.postalCode ? `CEP ${formatPostalCode(project.postalCode)}` : null,
	]
		.filter(Boolean)
		.join(", ");

interface ProjectDetailHeaderProps {
	project?: ProjectDetail;
	/** Read as the eyebrow above the name. */
	breadcrumb?: ReactNode;
	isLoading?: boolean;
	reanalysis?: boolean;
	/** The analyst's view: the strip dates the receipt of the project. */
	reviewing?: boolean;
	/** The designer sees the version a rejected project is being corrected into. */
	correcting?: boolean;
	/** Page-specific figures shown after the project's own. */
	metrics?: HeaderMetric[];
	/** Text links beside the name; the screen's primary stays in the footer. */
	actions?: ReactNode;
	className?: string;
}

export const ProjectDetailHeader = ({
	project,
	breadcrumb,
	isLoading = false,
	reanalysis = false,
	reviewing = false,
	correcting = false,
	metrics = [],
	actions,
	className,
}: ProjectDetailHeaderProps) => {
	const version = project
		? correcting
			? projectVersion(project)
			: project.reviewCycle
		: 0;
	const standards = project?.standards.map(
		({ name, revision }) => `${name} ${revision}`,
	);
	const responsible = project?.technicalResponsible
		? `${project.technicalResponsible.name}, CREA ${project.technicalResponsible.crea}`
		: undefined;
	const milestone = project ? milestoneOf(project, reviewing) : undefined;

	return (
		<header className={cn("flex flex-col border-b border-border", className)}>
			<dl className="flex flex-wrap gap-y-4 border-b border-border px-6 py-3.5 md:px-10">
				<StripCell isLoading={isLoading} label="Protocolo">
					{project ? (
						<>
							{project.protocol}
							{version > 0 ? (
								<span className="ml-2.5">v{padCount(version)}</span>
							) : null}
						</>
					) : undefined}
				</StripCell>

				<StripCell
					isLoading={isLoading}
					label="Norma aplicada"
					title={standards?.join(" e ")}
				>
					{standards?.[0]}
				</StripCell>

				<StripCell
					isLoading={isLoading}
					label="Responsável técnico"
					title={responsible}
				>
					{responsible}
				</StripCell>

				<StripCell isLoading={isLoading} label="Unidades">
					{project
						? `${padCount(project.consumerUnitsCount)} ${project.consumerUnitsCount === 1 ? "unidade" : "unidades"}`
						: undefined}
				</StripCell>

				<StripCell isLoading={isLoading} label="Demanda">
					{project
						? project.demandKva === null
							? "Sem cálculo"
							: formatKva(project.demandKva, 1)
						: undefined}
				</StripCell>

				{project?.status === "UNDER_REVIEW" ? (
					<>
						<StripCell
							isLoading={isLoading}
							label="Retorno até"
							title={deadlineTitleOf(project)}
						>
							{project.reviewDeadline ? (
								<>
									<StripDate value={project.reviewDeadline} />
									{project.deadlineStatus && project.daysRemaining != null ? (
										<DeadlineStatusBadge
											deadlineStatus={project.deadlineStatus}
											daysRemaining={project.daysRemaining}
											withRemaining
											className="ml-2.5"
										/>
									) : null}
								</>
							) : (
								"Prazo indisponível"
							)}
						</StripCell>
						<StripCell isLoading={isLoading} label="Analista">
							{project.reviewerName ?? "Aguardando atribuição"}
						</StripCell>
					</>
				) : null}

				<StripCell
					isLoading={isLoading}
					label={milestone?.label ?? "Última movimentação"}
				>
					{milestone ? <StripDate value={milestone.value} /> : undefined}
				</StripCell>

				{metrics.map((metric) => (
					<StripCell
						key={metric.label}
						isLoading={isLoading}
						label={metric.label}
					>
						{metric.value}
					</StripCell>
				))}
			</dl>

			<div className="flex flex-col gap-5 px-6 pt-7 pb-6 md:px-10 lg:flex-row lg:items-end lg:justify-between">
				<div className="flex min-w-0 flex-col gap-3">
					{breadcrumb}

					{project ? (
						<h1 className="font-heading text-3xl font-medium tracking-[-0.032em]">
							{project.name}
						</h1>
					) : (
						<Skeleton className="h-10 w-80 max-w-full" />
					)}

					{project ? (
						<div className="flex flex-wrap items-center gap-x-5 gap-y-2">
							<p className="flex items-center gap-2 border-l-2 border-foreground py-0.5 pl-2.5 font-mono text-2xs leading-none tracking-[0.11em] text-foreground uppercase">
								<span>
									<span className="sr-only">Situação: </span>
									{projectStatusLabels[project.status]}
								</span>
								{reanalysis ? (
									<span className="text-muted-foreground">(Reanálise)</span>
								) : null}
							</p>
							<p className="text-sm text-muted-foreground">
								{addressOf(project)}
							</p>
						</div>
					) : (
						<Skeleton className="h-4 w-64 max-w-full" />
					)}
				</div>

				{actions ? (
					<div className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-2">
						{actions}
					</div>
				) : null}
			</div>
		</header>
	);
};
