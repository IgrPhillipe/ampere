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
					Aprovar e publicar a tabela?
				</DialogTitle>
				<DialogDescription>
					Ao confirmar, esta revisão passa a valer no cálculo de demanda e
					substitui a tabela publicada de mesmo código. Depois de publicada, ela
					não pode mais ser alterada.
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
					{isPublishing ? "Publicando..." : "Aprovar e publicar"}
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
);
