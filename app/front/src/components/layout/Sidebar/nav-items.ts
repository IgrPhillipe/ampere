import type { UserRole } from "@features/auth/types";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
	to: string;
	label: string;
	icon: LucideIcon;
	/** Só casa com a rota exata; use em itens de indice como "/". */
	exact?: boolean;
	/** Sem `roles`, o item aparece para todo mundo. */
	roles?: UserRole[];
}

/**
 * Itens do menu lateral.
 *
 * Vazio de proposito: o scaffold entrega a estrutura, e cada tela acrescenta
 * o seu item junto com a rota. Ver `docs/tecnico/receitas-front.md`.
 */
export const APP_NAV_ITEMS: NavItem[] = [];

export const filterNavItemsByRole = (
	items: NavItem[],
	role: UserRole | undefined,
): NavItem[] =>
	items.filter((item) => !item.roles || (role && item.roles.includes(role)));
