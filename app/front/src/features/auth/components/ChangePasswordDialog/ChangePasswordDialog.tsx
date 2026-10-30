import { ControlledInput } from "@components/form";
import { Button } from "@components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@components/ui/dialog";
import { setApiFieldErrors, useZodForm } from "@features/shared";
import { useChangePassword } from "@services/users";

import {
	type ChangePasswordFormValues,
	changePasswordSchema,
} from "../../schemas";

interface ChangePasswordDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export const ChangePasswordDialog = ({
	open,
	onOpenChange,
}: ChangePasswordDialogProps) => {
	const form = useZodForm(changePasswordSchema, {
		currentPassword: "",
		newPassword: "",
		confirmNewPassword: "",
	});

	const { mutate: changePassword, isPending } = useChangePassword();

	const handleOpenChange = (nextOpen: boolean) => {
		if (isPending) return;

		form.reset();
		onOpenChange(nextOpen);
	};

	const onSubmit = ({
		currentPassword,
		newPassword,
	}: ChangePasswordFormValues) =>
		changePassword(
			{ currentPassword, newPassword },
			{
				onSuccess: () => {
					form.reset();
					onOpenChange(false);
				},
				onError: (error) =>
					setApiFieldErrors(form, error, { 422: "currentPassword" }),
			},
		);

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

				<form
					noValidate
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex flex-col gap-4"
				>
					<ControlledInput
						control={form.control}
						name="currentPassword"
						label="Senha atual"
						type="password"
						required
						autoComplete="current-password"
					/>

					<ControlledInput
						control={form.control}
						name="newPassword"
						label="Nova senha"
						type="password"
						required
						autoComplete="new-password"
					/>

					<ControlledInput
						control={form.control}
						name="confirmNewPassword"
						label="Confirmar nova senha"
						type="password"
						required
						autoComplete="new-password"
					/>

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
				</form>
			</DialogContent>
		</Dialog>
	);
};
