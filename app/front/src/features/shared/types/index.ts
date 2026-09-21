export type UserRole = "user" | "admin";

export interface CurrentUser {
	id: string;
	name: string;
	email: string;
	role: UserRole;
	avatarUrl?: string;
	/** JWT used by the `beforeRequest` of `@lib/http`. */
	token: string;
}

/** The envelope lives in `schemas/api.schema.ts`, inferred from Zod. */
export type { ApiResponse, Pagination } from "../schemas/api.schema";
