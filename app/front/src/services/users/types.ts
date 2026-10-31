import type { UserRole } from "@features/shared";

export interface ListUsersParams {
	page?: number;
	pageSize?: number;
	search?: string;
	role?: UserRole;
	active?: boolean;
}

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
