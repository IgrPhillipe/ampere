import { RowAction } from "@components/RowAction";
import type { Project } from "@services/projects";

import { getProjectRowAction, type ProjectRowActions } from "./project-row";

interface ProjectRowActionButtonProps extends ProjectRowActions {
	project: Project;
	buttonClassName?: string;
}

export const ProjectRowActionButton = ({
	project,
	buttonClassName,
	...actions
}: ProjectRowActionButtonProps) => {
	const action = getProjectRowAction(project);

	return (
		<RowAction
			label={action.label}
			required={action.required}
			buttonClassName={buttonClassName}
			onClick={() => action.run(actions, project)}
		/>
	);
};
