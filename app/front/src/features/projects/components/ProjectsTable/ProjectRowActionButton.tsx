import { RowAction } from "@components/RowAction";
import { Button } from "@components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import type { Project } from "@services/projects";
import { EllipsisVertical, Pencil, Trash2 } from "lucide-react";

import { useProjectPermissions } from "../../hooks";
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
	const { canEdit, canDelete, isOwner } = useProjectPermissions(project);
	const action = getProjectRowAction(project, isOwner);
	// The owner reaches the edit through "Continuar" or "Corrigir"; the admin needs the item.
	const canEditSubmitted = canEdit && !isOwner && project.status !== "DRAFT";

	return (
		<div className="flex items-center justify-end gap-1">
			<RowAction
				label={action.label}
				required={action.required}
				buttonClassName={buttonClassName}
				onClick={() => action.run(actions, project)}
			/>

			{canDelete || canEditSubmitted ? (
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
						{canEditSubmitted ? (
							<DropdownMenuItem onClick={() => actions.onEditProject(project)}>
								<Pencil aria-hidden="true" />
								Editar Projeto
							</DropdownMenuItem>
						) : null}
						{canDelete ? (
							<DropdownMenuItem
								variant="destructive"
								onClick={() => actions.onDeleteProject(project)}
							>
								<Trash2 aria-hidden="true" />
								Excluir Projeto
							</DropdownMenuItem>
						) : null}
					</DropdownMenuContent>
				</DropdownMenu>
			) : (
				// Keeps the main action aligned with the rows that have the menu.
				<span aria-hidden="true" className="size-8 shrink-0" />
			)}
		</div>
	);
};
