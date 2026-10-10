import { Badge } from "@components/ui/badge";
import type { Project } from "@services/projects";

import {
	projectStatusBadgeVariants,
	projectStatusLabels,
} from "../../constants";

interface ProjectStatusBadgeProps {
	project: Project;
}

export const ProjectStatusBadge = ({ project }: ProjectStatusBadgeProps) => (
	<Badge variant={projectStatusBadgeVariants[project.status]}>
		{projectStatusLabels[project.status]}
	</Badge>
);
