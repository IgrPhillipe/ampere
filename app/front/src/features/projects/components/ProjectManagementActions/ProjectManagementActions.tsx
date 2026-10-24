import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";
import { Pencil, Trash2 } from "lucide-react";

import type { ProjectDetailActions } from "../../constants";

interface ProjectManagementActionsProps {
	actions: Pick<ProjectDetailActions, "edit" | "delete">;
	onEdit: () => void;
	onDelete: () => void;
	className?: string;
}

export const ProjectManagementActions = ({
	actions,
	onEdit,
	onDelete,
	className,
}: ProjectManagementActionsProps) =>
	actions.edit || actions.delete ? (
		<div className={cn("flex flex-wrap gap-2", className)}>
			{actions.edit ? (
				<Button type="button" variant="ghost" onClick={onEdit}>
					<Pencil aria-hidden="true" />
					Editar Projeto
				</Button>
			) : null}
			{actions.delete ? (
				<Button type="button" variant="destructive-ghost" onClick={onDelete}>
					<Trash2 aria-hidden="true" />
					Excluir Projeto
				</Button>
			) : null}
		</div>
	) : null;
