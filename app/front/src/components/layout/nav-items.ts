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
	{
		to: "/fila-de-analise",
		label: "Fila de Análise",
		roles: ["admin"],
	},
	{ to: "/projetos", label: "Meus Projetos", exact: true, roles: ["user"] },
	{
		to: "/tabelas-normativas",
		label: "Tabelas Normativas",
		roles: ["admin"],
	},
];

export const filterNavItemsByRole = (
	items: NavItem[],
	role: UserRole | undefined,
): NavItem[] =>
	items.filter((item) => !item.roles || (role && item.roles.includes(role)));
