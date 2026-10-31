import { ControlledInput, ControlledSelect } from "@components/form";
import { Button } from "@components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@components/ui/dialog";
import { setApiFieldErrors, useAuthStore, useZodForm } from "@features/shared";
import {
	type ManagedUser,
	type TemporaryAccess,
	useCreateUser,
	useUpdateUser,
} from "@services/users";
import { useEffect } from "react";

import { userRoleLabels } from "../../constants";
import { type UserFormValues, userFormSchema } from "../../schemas";

interface UserFormDialogProps {
	open: boolean;
	/** Without a user the dialog creates one. */
	user: ManagedUser | null;
	onOpenChange: (open: boolean) => void;
	onCreated: (access: TemporaryAccess) => void;
}

const emptyValues: Partial<UserFormValues> = { name: "", email: "" };

export const UserFormDialog = ({
	open,
	user,
	onOpenChange,
	onCreated,
}: UserFormDialogProps) => {
	const currentUserId = useAuthStore((state) => state.user?.id);
	const isEditing = user !== null;
	const isCurrentUser = isEditing && user.id === currentUserId;
	const form = useZodForm(userFormSchema, emptyValues);
	const createUser = useCreateUser();
	const updateUser = useUpdateUser();
	const isPending = createUser.isPending || updateUser.isPending;

	useEffect(() => {
		if (!open) return;

		form.reset(
			user
				? { name: user.name, email: user.email, role: user.role }
				: emptyValues,
		);
	}, [open, user, form]);

	const handleOpenChange = (nextOpen: boolean) => {
		if (isPending) return;

		onOpenChange(nextOpen);
	};

	const onSubmit = ({ name, email, role }: UserFormValues) => {
		if (!user) {
			createUser.mutate(
				{ name, email, role },
				{
					onSuccess: ({ data }) => {
						onOpenChange(false);
						onCreated(data);
					},
					onError: (error) => setApiFieldErrors(form, error, { 409: "email" }),
				},
			);
			return;
		}

		updateUser.mutate(
			{
				id: user.id,
				payload: { name, role, active: user.active },
			},
			{
				onSuccess: () => onOpenChange(false),
				// A new role with work in progress comes back as 409.
				onError: (error) => setApiFieldErrors(form, error, { 409: "role" }),
			},
		);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent
				className="bg-card sm:max-w-md"
				showCloseButton={!isPending}
			>
				<DialogHeader>
					<DialogTitle className="font-heading text-xl">
						{isEditing ? "Editar Usuário" : "Novo Usuário"}
					</DialogTitle>

					<DialogDescription>
						{isEditing
							? "Altere o nome e o papel. O e-mail não muda depois do cadastro."
							: "A conta nasce com uma senha temporária, exibida uma única vez ao salvar."}
					</DialogDescription>
				</DialogHeader>

				<form
					noValidate
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex flex-col gap-4"
				>
					<ControlledInput
						control={form.control}
						name="name"
						label="Nome"
						required
						autoComplete="off"
					/>

					<ControlledInput
						control={form.control}
						name="email"
						label="E-mail"
						type="email"
						required
						disabled={isEditing}
						autoComplete="off"
					/>

					<ControlledSelect
						control={form.control}
						name="role"
						label="Papel"
						placeholder="Selecione o papel"
						items={userRoleLabels}
						required
						disabled={isCurrentUser}
						description={
							isCurrentUser
								? "Você não pode remover o próprio papel de administrador."
								: undefined
						}
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
							{isEditing
								? isPending
									? "Salvando..."
									: "Salvar Alterações"
								: isPending
									? "Criando..."
									: "Criar Usuário"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
