import { Button } from "@components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@components/ui/dialog";

interface NormativeTableConfirmDialogProps {
	open: boolean;
	title: string;
	description: string;
	confirmLabel: string;
	pendingLabel: string;
	isPending: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
}

export const NormativeTableConfirmDialog = ({
	open,
	title,
	description,
	confirmLabel,
	pendingLabel,
	isPending,
	onOpenChange,
	onConfirm,
}: NormativeTableConfirmDialogProps) => (
	<Dialog open={open} onOpenChange={onOpenChange}>
		<DialogContent className="bg-card">
			<DialogHeader>
				<DialogTitle className="font-heading text-xl">{title}</DialogTitle>
				<DialogDescription>{description}</DialogDescription>
			</DialogHeader>

			<DialogFooter>
				<Button
					type="button"
					variant="ghost"
					onClick={() => onOpenChange(false)}
				>
					Cancelar
				</Button>

				<Button type="button" onClick={onConfirm} disabled={isPending}>
					{isPending ? pendingLabel : confirmLabel}
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
);
