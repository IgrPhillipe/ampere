import { Skeleton } from "@components/ui/skeleton";
import { formatDate } from "@features/shared";
import { cn } from "@lib/utils";
import type { ProjectDetail } from "@services/projects";
import type { ReactNode } from "react";

import { projectVersion } from "../../constants";

interface ProjectStampProps {
	project?: ProjectDetail;
	isLoading?: boolean;
	units?: ReactNode;
	className?: string;
}

interface StampCellProps {
	label: string;
	isLoading: boolean;
	children?: ReactNode;
}

const StampCell = ({ label, isLoading, children }: StampCellProps) => (
	<div className="flex flex-col gap-1.5 bg-card px-6 py-4 sm:last:odd:col-span-2 md:px-8 lg:last:odd:col-span-1">
		<dt className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
			{label}
		</dt>
		<dd className="font-mono text-sm text-foreground">
			{children ??
				(isLoading ? <Skeleton className="h-5 w-32" /> : "Não informado")}
		</dd>
	</div>
);

export const ProjectStamp = ({
	project,
	isLoading = false,
	units,
	className,
}: ProjectStampProps) => (
	<dl
		className={cn(
			"grid gap-px border-b border-border bg-border sm:grid-cols-2",
			project && project.reviewCycle > 0 ? "lg:grid-cols-5" : "lg:grid-cols-4",
			className,
		)}
	>
		<StampCell isLoading={isLoading} label="Norma aplicada">
			{project
				? project.standards
						.map(({ name, revision }) => `${name} ${revision}`)
						.join(" e ")
				: undefined}
		</StampCell>

		<StampCell isLoading={isLoading} label="Responsável técnico">
			{project?.technicalResponsible
				? `${project.technicalResponsible.name}, CREA ${project.technicalResponsible.crea}`
				: undefined}
		</StampCell>

		<StampCell isLoading={isLoading} label="Unidades">
			{units}
		</StampCell>

		<StampCell isLoading={isLoading} label="Emissão">
			{project ? (
				<time dateTime={project.createdAt}>
					{formatDate(project.createdAt)}
				</time>
			) : undefined}
		</StampCell>

		{project && project.reviewCycle > 0 ? (
			<StampCell isLoading={isLoading} label="Versão">
				{projectVersion(project)}
			</StampCell>
		) : null}
	</dl>
);
