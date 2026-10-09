import { AttentionIndicator } from "@components/AttentionIndicator";
import type { Project } from "@services/projects";

import { getProjectActionLabel } from "./project-row";

interface ProjectActionIndicatorProps {
	project: Project;
	className?: string;
}

export const ProjectActionIndicator = ({
	project,
	className,
}: ProjectActionIndicatorProps) => {
	const label = getProjectActionLabel(project);

	return label ? (
		<AttentionIndicator label={label} className={className} />
	) : null;
};
