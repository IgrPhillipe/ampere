export interface ProfileRequestPayload {
	name: string;
	crea?: string | null;
	creaState?: string | null;
	company?: string | null;
	phone?: string | null;
}

export interface ChangePasswordRequestPayload {
	currentPassword: string;
	newPassword: string;
}
