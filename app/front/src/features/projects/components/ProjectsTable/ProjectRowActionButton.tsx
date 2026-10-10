import { Button } from "@components/ui/button";
import type { Project } from "@services/projects";
import { ArrowRight } from "lucide-react";

import { getProjectRowAction, type ProjectRowActions } from "./project-row";

interface ProjectRowActionButtonProps extends ProjectRowActions {
	project: Project;
}

export const ProjectRowActionButton = ({
	project,
	...actions
}: ProjectRowActionButtonProps) => {
	const action = getProjectRowAction(project);

	return (
		<Button
			type="button"
			size="xs"
			variant={action.required ? "default" : "outline"}
			onClick={() => action.run(actions, project)}
		>
			{action.label}
			<ArrowRight aria-hidden="true" />
		</Button>
	);
};
