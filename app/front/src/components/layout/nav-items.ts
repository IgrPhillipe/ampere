import type { UserRole } from "@features/shared";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
	to?: string;
	label: string;
	icon?: LucideIcon;
	/** Matches the exact route only; use it on index items like "/". */
	exact?: boolean;
	/** Without `roles`, the item shows for everyone. */
	roles?: UserRole[];
	/** Keeps a future area visible without offering a route that does not exist. */
	disabled?: boolean;
}

export const APP_NAV_ITEMS: NavItem[] = [
	{ to: "/", label: "Meus Projetos", exact: true },
	{ to: "/projetos/novo", label: "Novo Projeto" },
	{ to: "/admin/normas", label: "Normas e Tabelas", roles: ["admin"] },
	{ label: "Ajuda", disabled: true },
];

export const filterNavItemsByRole = (
	items: NavItem[],
	role: UserRole | undefined,
): NavItem[] =>
	items.filter((item) => !item.roles || (role && item.roles.includes(role)));
