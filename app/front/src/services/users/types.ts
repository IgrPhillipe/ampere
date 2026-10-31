import type { UserRole } from "@features/shared";

export interface ListUsersParams {
	page?: number;
	pageSize?: number;
	search?: string;
	role?: UserRole;
	active?: boolean;
}
