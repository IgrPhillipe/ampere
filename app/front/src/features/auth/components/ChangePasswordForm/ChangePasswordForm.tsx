import { ControlledInput } from "@components/form";
import type { ReactNode } from "react";

import type { useChangePasswordForm } from "./useChangePasswordForm";

type ChangePasswordFormState = ReturnType<typeof useChangePasswordForm>;

interface ChangePasswordFormProps {
	form: ChangePasswordFormState["form"];
	onSubmit: ChangePasswordFormState["submit"];
	currentPasswordLabel?: string;
	/** The submit and cancel buttons, which differ between the dialog and the page. */
	children: ReactNode;
}

export const ChangePasswordForm = ({
	form,
	onSubmit,
	currentPasswordLabel = "Senha atual",
	children,
}: ChangePasswordFormProps) => (
	<form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
		<ControlledInput
			control={form.control}
			name="currentPassword"
			label={currentPasswordLabel}
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

		{children}
	</form>
);
