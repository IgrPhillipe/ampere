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
import { useZodForm } from "@features/shared";
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

	const { mutate: changeUserPassword, isPending } = useChangePassword();

	const onSubmit = (values: ChangePasswordFormValues) => {
		changeUserPassword(
			{
				currentPassword: values.currentPassword,
				newPassword: values.newPassword,
			},
			{
				onSuccess: () => {
					form.reset();
					onOpenChange(false);
				},
				onError: (error) => {
					// @ts-expect-error ky response status check
					if (error?.response?.status === 422) {
						form.setError("currentPassword", {
							type: "manual",
							message: "A senha atual está incorreta.",
						});
					}
				},
			},
		);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				if (!isPending) {
					form.reset();
					onOpenChange(nextOpen);
				}
			}}
		>
			<DialogContent className="sm:max-w-md bg-card">
				<DialogHeader>
					<DialogTitle className="font-heading text-xl">
						Alterar senha
					</DialogTitle>
					<DialogDescription>
						A nova senha deve ter ao menos 8 caracteres, com letra e número.
					</DialogDescription>
				</DialogHeader>

				<form
					noValidate
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex flex-col gap-4 py-2"
				>
					<ControlledInput
						control={form.control}
						name="currentPassword"
						label="SENHA ATUAL"
						type="password"
						required
						autoComplete="current-password"
					/>

					<ControlledInput
						control={form.control}
						name="newPassword"
						label="NOVA SENHA"
						type="password"
						required
						autoComplete="new-password"
					/>

					<ControlledInput
						control={form.control}
						name="confirmNewPassword"
						label="CONFIRMAR NOVA SENHA"
						type="password"
						required
						autoComplete="new-password"
					/>

					<DialogFooter className="mt-4 gap-2">
						<Button
							type="button"
							variant="outline"
							disabled={isPending}
							onClick={() => onOpenChange(false)}
						>
							Cancelar
						</Button>

						<Button
							type="submit"
							disabled={isPending}
							className="rounded-[4px] bg-[#006C3B] text-white hover:bg-[#005B31]"
						>
							{isPending ? "Alterando..." : "Alterar senha"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
