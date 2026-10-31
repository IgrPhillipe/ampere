import { setApiFieldErrors, useZodForm } from "@features/shared";
import { useChangePassword } from "@services/users";

import {
	type ChangePasswordFormValues,
	changePasswordSchema,
} from "../../schemas";

interface UseChangePasswordFormOptions {
	onSuccess: () => void;
}

export const useChangePasswordForm = ({
	onSuccess,
}: UseChangePasswordFormOptions) => {
	const form = useZodForm(changePasswordSchema, {
		currentPassword: "",
		newPassword: "",
		confirmNewPassword: "",
	});

	const { mutate: changePassword, isPending } = useChangePassword();

	const onSubmit = ({
		currentPassword,
		newPassword,
	}: ChangePasswordFormValues) =>
		changePassword(
			{ currentPassword, newPassword },
			{
				onSuccess: () => {
					form.reset();
					onSuccess();
				},
				onError: (error) =>
					setApiFieldErrors(form, error, { 422: "currentPassword" }),
			},
		);

	return { form, isPending, submit: form.handleSubmit(onSubmit) };
};
