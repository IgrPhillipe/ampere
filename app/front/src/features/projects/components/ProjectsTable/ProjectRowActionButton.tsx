import { InlineActionButton } from "@components/InlineActionButton";
import { Button } from "@components/ui/button";
import type { Project } from "@services/projects";
import { ArrowRight } from "lucide-react";

import { getProjectRowAction, type ProjectRowActions } from "./project-row";

interface ProjectRowActionButtonProps extends ProjectRowActions {
	project: Project;
	/** Width of the filled button; the link keeps its own width. */
	buttonClassName?: string;
}

export const ProjectRowActionButton = ({
	project,
	buttonClassName,
	...actions
}: ProjectRowActionButtonProps) => {
	const action = getProjectRowAction(project);

	if (!action.required) {
		return (
			<InlineActionButton onClick={() => action.run(actions, project)}>
				{action.label}
			</InlineActionButton>
		);
	}

	return (
		<Button
			type="button"
			size="xs"
			onClick={() => action.run(actions, project)}
			className={buttonClassName}
		>
			{action.label}
			<ArrowRight aria-hidden="true" />
		</Button>
	);
};
