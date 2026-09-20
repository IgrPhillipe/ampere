/** Pagination metadata, present on list responses. */
export interface Pagination {
	total: number;
	page: number;
	pageSize: number;
}

/** Standard envelope returned by API endpoints. */
export interface ApiResponse<T> {
	data: T;
	pagination?: Pagination;
}

/**
 * Papeis de usuario.
 *
 * Placeholder deliberado: os papeis reais do AMPERE (projetista externo e
 * analista da Neoenergia) dependem da Q1c de `docs/produto/questoes-em-aberto.md`
 * — "Pessoa de fora da Neoenergia pode acessar um sistema interno?" — que
 * ainda esta aberta. Estreitar esta uniao depois e uma troca de uma linha.
 */
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
