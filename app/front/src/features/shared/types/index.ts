export type UserRole = "user" | "admin";

export interface CurrentUser {
	id: string;
	name: string;
	email: string;
	role: UserRole;
	avatarUrl?: string;
	/** JWT usado pelo `beforeRequest` de `@lib/http`. */
	token: string;
}

/** O envelope mora em `schemas/api.schema.ts`, inferido do Zod. */
export type { ApiResponse, Pagination } from "../schemas/api.schema";
