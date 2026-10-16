import { Button } from "@components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@components/ui/dialog";
import { cn } from "@lib/utils";
import type { ReactNode } from "react";

interface ConfirmDialogProps {
	open: boolean;
	title: string;
	description: ReactNode;
	confirmLabel: string;
	pendingLabel: string;
	isPending: boolean;
	destructive?: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	className?: string;
}

/** Stays open while the request runs, so the action cannot be dismissed halfway. */
export const ConfirmDialog = ({
	open,
	title,
	description,
	confirmLabel,
	pendingLabel,
	isPending,
	destructive = false,
	onOpenChange,
	onConfirm,
	className,
}: ConfirmDialogProps) => (
	<Dialog
		open={open}
		onOpenChange={(nextOpen) => {
			if (!isPending) onOpenChange(nextOpen);
		}}
	>
		<DialogContent
			className={cn("bg-card", className)}
			showCloseButton={!isPending}
		>
			<DialogHeader>
				<DialogTitle className="font-heading text-xl">{title}</DialogTitle>
				<DialogDescription>{description}</DialogDescription>
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
					variant={destructive ? "destructive" : "default"}
					onClick={onConfirm}
					disabled={isPending}
				>
					{isPending ? pendingLabel : confirmLabel}
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
);
