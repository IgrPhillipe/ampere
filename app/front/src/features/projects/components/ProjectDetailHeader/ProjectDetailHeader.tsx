import { Badge } from "@components/ui/badge";
import { Skeleton } from "@components/ui/skeleton";
import { formatDate, formatKva, formatPostalCode } from "@features/shared";
import { cn } from "@lib/utils";
import {
	type ConcessionState,
	concessionStateNames,
} from "@services/locations";
import type { ProjectDetail } from "@services/projects";
import type { CSSProperties, ReactNode } from "react";

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
	<div className="flex min-w-0 flex-col gap-1.5 bg-card px-6 py-4 last:odd:col-span-2 md:px-8 lg:last:odd:col-span-1">
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
	<time dateTime={value}>{formatDate(value)}</time>
);

export interface HeaderMetric {
	label: string;
	value?: ReactNode;
}

interface AddressItemProps {
	label: string;
	isLoading: boolean;
	children?: ReactNode;
	className?: string;
}

const AddressItem = ({
	label,
	isLoading,
	children,
	className,
}: AddressItemProps) => (
	<div className={cn("flex min-w-0 flex-col gap-1", className)}>
		<dt className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
			{label}
		</dt>
		<dd className="text-sm break-words text-foreground">
			{children ??
				(isLoading ? <Skeleton className="h-5 w-24" /> : "Não informado")}
		</dd>
	</div>
);

interface ProjectDetailHeaderProps {
	project?: ProjectDetail;
	breadcrumb?: ReactNode;
	isLoading?: boolean;
	units?: string;
	demandKva?: number | null;
	reanalysis?: boolean;
	/** The designer sees the version a rejected project is being corrected into. */
	correcting?: boolean;
	/** Page-specific figures shown after the project's own. */
	metrics?: HeaderMetric[];
	className?: string;
}

const BASE_METRICS = 7;

export const ProjectDetailHeader = ({
	project,
	breadcrumb,
	isLoading = false,
	units,
	demandKva,
	reanalysis = false,
	correcting = false,
	metrics = [],
	className,
}: ProjectDetailHeaderProps) => (
	<header className={cn("flex flex-col border-b border-border", className)}>
		{breadcrumb ? (
			<div className="border-b border-border px-6 py-4 md:px-8">
				{breadcrumb}
			</div>
		) : null}

		<div className="flex flex-col gap-3 px-6 pt-8 pb-6 md:px-8">
			{project ? (
				<p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
					Protocolo {project.protocol}
				</p>
			) : (
				<Skeleton className="h-4 w-40" />
			)}

			{project ? (
				<div className="flex flex-wrap items-center gap-x-4 gap-y-2">
					<h1 className="font-heading text-3xl font-semibold tracking-tight">
						{project.name}
					</h1>
					<div className="flex flex-wrap items-center gap-2">
						<Badge variant={projectStatusBadgeVariants[project.status]}>
							{projectStatusLabels[project.status]}
						</Badge>
						{reanalysis ? <Badge variant="tag">Reanálise</Badge> : null}
					</div>
				</div>
			) : (
				<Skeleton className="h-9 w-80 max-w-full" />
			)}

			<dl
				aria-label="Endereço da edificação"
				className="mt-3 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-[auto_auto_auto_minmax(0,1fr)]"
			>
				<AddressItem isLoading={isLoading} label="CEP">
					{project?.postalCode
						? formatPostalCode(project.postalCode)
						: undefined}
				</AddressItem>
				<AddressItem isLoading={isLoading} label="UF">
					{project
						? (concessionStateNames[project.state as ConcessionState] ??
							project.state)
						: undefined}
				</AddressItem>
				<AddressItem isLoading={isLoading} label="Município">
					{project?.municipality}
				</AddressItem>
				<AddressItem isLoading={isLoading} label="Endereço">
					{project?.address}
				</AddressItem>
			</dl>
		</div>

		<dl
			style={
				{
					"--metric-columns": `repeat(${BASE_METRICS + metrics.length}, minmax(0, 1fr))`,
				} as CSSProperties
			}
			className="grid grid-cols-2 gap-px border-t border-border bg-border lg:grid-cols-(--metric-columns)"
		>
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
						? String(projectVersion(project))
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

			{metrics.map((metric) => (
				<HeaderCell
					key={metric.label}
					isLoading={isLoading}
					label={metric.label}
				>
					{metric.value}
				</HeaderCell>
			))}
		</dl>
	</header>
);
