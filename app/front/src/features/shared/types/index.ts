export type UserRole = "user" | "reviewer" | "admin";

export interface CurrentUser {
	id: string;
	name: string;
	email: string;
	role: UserRole;
	mustChangePassword: boolean;
	avatarUrl?: string;
	/** JWT used by the `beforeRequest` of `@lib/http`. */
	token: string;
}

/** The envelope lives in `schemas/api.schema.ts`, inferred from Zod. */
export type { ApiResponse, Pagination } from "../schemas/api.schema";
