import type { UserRole } from "@features/shared";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
	to?: string;
	label: string;
	icon?: LucideIcon;
	/** Só casa com a rota exata; use em itens de indice como "/". */
	exact?: boolean;
	/** Sem `roles`, o item aparece para todo mundo. */
	roles?: UserRole[];
	/** Mantém uma área futura visível sem oferecer uma rota inexistente. */
	disabled?: boolean;
}

/**
 * Itens da navegação principal. As áreas ainda não entregues permanecem
 * desabilitadas até suas respectivas rotas serem implementadas.
 */
export const APP_NAV_ITEMS: NavItem[] = [
	{ to: "/", label: "Meus projetos", exact: true },
	{ to: "/projects/new", label: "Novo projeto" },
	{ label: "Normas e tabelas", disabled: true },
	{ label: "Ajuda", disabled: true },
];

export const filterNavItemsByRole = (
	items: NavItem[],
	role: UserRole | undefined,
): NavItem[] =>
	items.filter((item) => !item.roles || (role && item.roles.includes(role)));
