import { Button } from "@components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@components/ui/dialog";

interface PublishNormativeTableDialogProps {
	open: boolean;
	isPublishing: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
}

export const PublishNormativeTableDialog = ({
	open,
	isPublishing,
	onOpenChange,
	onConfirm,
}: PublishNormativeTableDialogProps) => (
	<Dialog open={open} onOpenChange={onOpenChange}>
		<DialogContent className="bg-card">
			<DialogHeader>
				<DialogTitle className="font-heading text-xl">
					Publicar tabela?
				</DialogTitle>
				<DialogDescription>
					Publicar torna esta revisão imutável e substitui a tabela publicada de
					mesmo código. Quem publica precisa ser outra pessoa, não quem
					cadastrou.
				</DialogDescription>
			</DialogHeader>

			<DialogFooter>
				<Button
					type="button"
					variant="ghost"
					onClick={() => onOpenChange(false)}
				>
					Cancelar
				</Button>

				<Button type="button" onClick={onConfirm} disabled={isPublishing}>
					{isPublishing ? "Publicando..." : "Publicar"}
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
);
