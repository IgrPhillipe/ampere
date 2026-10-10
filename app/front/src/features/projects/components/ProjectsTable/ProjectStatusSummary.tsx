import { Badge } from "@components/ui/badge";
import type { Project } from "@services/projects";

import {
	projectStatusBadgeVariants,
	projectStatusLabels,
} from "../../constants";
import { isRejectedWithFindings } from "./project-row";

interface ProjectStatusSummaryProps {
	project: Project;
}

export const ProjectStatusSummary = ({
	project,
}: ProjectStatusSummaryProps) => (
	<div className="flex flex-col items-start gap-1.5">
		<Badge variant={projectStatusBadgeVariants[project.status]}>
			{projectStatusLabels[project.status]}
		</Badge>

		{isRejectedWithFindings(project) ? (
			<span className="text-xs text-muted-foreground">
				{project.pendingCount}{" "}
				{project.pendingCount === 1 ? "pendência" : "pendências"}
			</span>
		) : null}
	</div>
);
