import { Badge } from "@components/ui/badge";
import { padCount } from "@features/shared";
import type { Project } from "@services/projects";

import {
	projectStatusBadgeVariants,
	projectStatusLabels,
} from "../../constants";

interface ProjectStatusBadgeProps {
	project: Project;
	/** Appends the open findings, as in "Reprovado, 03 pendências". */
	showPending?: boolean;
}

/** Ink only where the designer has to act; the other states recede. */
export const ProjectStatusBadge = ({
	project,
	showPending = false,
}: ProjectStatusBadgeProps) => {
	const needsAction =
		project.status === "REJECTED" || project.status === "AWAITING_SUBMISSION";
	const pending = showPending ? project.pendingCount : 0;

	return (
		<Badge
			variant={projectStatusBadgeVariants[project.status]}
			className={needsAction ? "text-foreground" : "text-muted-foreground"}
		>
			{projectStatusLabels[project.status]}
			{pending > 0
				? `, ${padCount(pending)} ${pending === 1 ? "pendência" : "pendências"}`
				: null}
		</Badge>
	);
};
