import { Button } from "@components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@components/ui/dialog";

import {
	ChangePasswordForm,
	useChangePasswordForm,
} from "../ChangePasswordForm";

interface ChangePasswordDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export const ChangePasswordDialog = ({
	open,
	onOpenChange,
}: ChangePasswordDialogProps) => {
	const { form, isPending, submit } = useChangePasswordForm({
		onSuccess: () => onOpenChange(false),
	});

	const handleOpenChange = (nextOpen: boolean) => {
		if (isPending) return;

		form.reset();
		onOpenChange(nextOpen);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent
				className="bg-card sm:max-w-md"
				showCloseButton={!isPending}
			>
				<DialogHeader>
					<DialogTitle className="font-heading text-xl">
						Alterar Senha
					</DialogTitle>

					<DialogDescription>
						A nova senha deve ter ao menos 8 caracteres, com letra e número.
					</DialogDescription>
				</DialogHeader>

				<ChangePasswordForm form={form} onSubmit={submit}>
					<DialogFooter className="mt-4">
						<Button
							type="button"
							variant="outline"
							disabled={isPending}
							onClick={() => handleOpenChange(false)}
						>
							Cancelar
						</Button>

						<Button type="submit" disabled={isPending}>
							{isPending ? "Alterando..." : "Alterar Senha"}
						</Button>
					</DialogFooter>
				</ChangePasswordForm>
			</DialogContent>
		</Dialog>
	);
};
