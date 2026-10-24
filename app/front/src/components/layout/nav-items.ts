import type { UserRole } from "@features/shared";
import { ROLE_ACCESS } from "@lib/route-guard";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
	to?: string;
	label: string;
	icon?: LucideIcon;
	/** Matches the exact route only; use it on index items like "/". */
	exact?: boolean;
	/** Without `roles`, the item shows for everyone. */
	roles?: readonly UserRole[];
	/** Keeps a future area visible without offering a route that does not exist. */
	disabled?: boolean;
}

export const APP_NAV_ITEMS: NavItem[] = [
	{ to: "/projetos", label: "Meus Projetos", exact: true, roles: ["user"] },
	{ to: "/projetos", label: "Projetos", exact: true, roles: ["admin"] },
	{
		to: "/fila-de-analise",
		label: "Fila de Análise",
		roles: ROLE_ACCESS.reviewQueue,
	},
	{
		to: "/tabelas-normativas",
		label: "Tabelas Normativas",
		roles: ROLE_ACCESS.normativeTables,
	},
];

export const filterNavItemsByRole = (
	items: NavItem[],
	role: UserRole | undefined,
): NavItem[] =>
	items.filter((item) => !item.roles || (role && item.roles.includes(role)));
