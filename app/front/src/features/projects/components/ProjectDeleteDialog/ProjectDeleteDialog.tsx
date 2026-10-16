import { ConfirmDialog } from "@components/ConfirmDialog";
import type { Project } from "@services/projects";

interface ProjectDeleteDialogProps {
	project: Project | null;
	isPending: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
}

export const ProjectDeleteDialog = ({
	project,
	isPending,
	onOpenChange,
	onConfirm,
}: ProjectDeleteDialogProps) => (
	<ConfirmDialog
		open={project !== null}
		title="Excluir projeto?"
		description={
			<>
				Você está prestes a excluir o projeto{" "}
				<strong className="text-foreground">{project?.name}</strong>, protocolo{" "}
				<strong className="font-mono text-foreground">
					{project?.protocol}
				</strong>
				. Os grupos de unidades consumidoras, cálculos e documentos desse
				projeto também serão removidos. Esta ação não pode ser desfeita.
			</>
		}
		confirmLabel="Excluir Projeto"
		pendingLabel="Excluindo..."
		isPending={isPending}
		destructive
		onOpenChange={onOpenChange}
		onConfirm={onConfirm}
	/>
);
