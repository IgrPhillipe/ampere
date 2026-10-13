import { RowAction } from "@components/RowAction";
import { Button } from "@components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import type { Project } from "@services/projects";
import { EllipsisVertical, Trash2 } from "lucide-react";

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
		<div className="flex items-center justify-end gap-1">
			<RowAction
				label={action.label}
				required={action.required}
				buttonClassName={buttonClassName}
				onClick={() => action.run(actions, project)}
			/>

			{project.status === "DRAFT" ? (
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button
								type="button"
								variant="ghost"
								size="icon-xs"
								aria-label={`Ações do projeto ${project.name}`}
							/>
						}
					>
						<EllipsisVertical aria-hidden="true" />
					</DropdownMenuTrigger>

					<DropdownMenuContent align="end">
						<DropdownMenuItem
							variant="destructive"
							onClick={() => actions.onDeleteProject(project)}
						>
							<Trash2 aria-hidden="true" />
							Excluir Projeto
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			) : null}
		</div>
	);
};
