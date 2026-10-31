export const UserEndpoints = {
	list: "users",
	detail: (id: string) => `users/${id}`,
	passwordReset: (id: string) => `users/${id}/password-reset`,
	profile: "users/me",
	changePassword: "users/me/password",
} as const;
