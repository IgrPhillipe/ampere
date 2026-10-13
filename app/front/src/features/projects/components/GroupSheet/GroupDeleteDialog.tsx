import { Button } from "@components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@components/ui/dialog";

interface GroupDeleteDialogProps {
	groupName: string;
	open: boolean;
	isPending: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
}

export const GroupDeleteDialog = ({
	groupName,
	open,
	isPending,
	onOpenChange,
	onConfirm,
}: GroupDeleteDialogProps) => (
	<Dialog
		open={open}
		onOpenChange={(nextOpen) => {
			if (!isPending) onOpenChange(nextOpen);
		}}
	>
		<DialogContent className="bg-card" showCloseButton={!isPending}>
			<DialogHeader>
				<DialogTitle className="font-heading text-xl">
					Excluir grupo?
				</DialogTitle>
				<DialogDescription>
					O grupo <strong className="text-foreground">{groupName}</strong> será
					removido do projeto. Esta ação não pode ser desfeita.
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
					{isPending ? "Excluindo..." : "Excluir Grupo"}
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
);
