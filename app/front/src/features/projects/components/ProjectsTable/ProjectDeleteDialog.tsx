import { Button } from "@components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@components/ui/dialog";
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
	<Dialog
		open={project !== null}
		onOpenChange={(open) => {
			if (!isPending) onOpenChange(open);
		}}
	>
		<DialogContent className="bg-card" showCloseButton={!isPending}>
			<DialogHeader>
				<DialogTitle className="font-heading text-xl">
					Excluir projeto?
				</DialogTitle>
				<DialogDescription>
					Você está prestes a excluir o projeto{" "}
					<strong className="text-foreground">{project?.name}</strong>,
					protocolo{" "}
					<strong className="font-mono text-foreground">
						{project?.protocol}
					</strong>
					. Os grupos de unidades consumidoras, cálculos e documentos desse
					projeto também serão removidos. Esta ação não pode ser desfeita.
				</DialogDescription>
			</DialogHeader>

			<DialogFooter>
				<Button
					type="button"
					variant="ghost"
					onClick={() => onOpenChange(false)}
					disabled={isPending}
				>
					Cancelar
				</Button>

				<Button
					type="button"
					variant="destructive"
					onClick={onConfirm}
					disabled={isPending}
				>
					{isPending ? "Excluindo..." : "Excluir Projeto"}
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
);
