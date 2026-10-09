import { AttentionIndicator } from "@components/AttentionIndicator";
import type { Project } from "@services/projects";

import { getProjectAttention } from "./project-row";

interface ProjectActionIndicatorProps {
	project: Project;
	className?: string;
}

export const ProjectActionIndicator = ({
	project,
	className,
}: ProjectActionIndicatorProps) => {
	const message = getProjectAttention(project);

	return message ? (
		<AttentionIndicator message={message} className={className} />
	) : null;
};
