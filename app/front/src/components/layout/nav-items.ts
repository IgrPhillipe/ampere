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
	/** Folds the item into a header dropdown, only for these roles. */
	group?: NavGroup;
}

export interface NavGroup {
	label: string;
	roles: readonly UserRole[];
}

/** The admin's analysis areas: flat, they would not fit the header from 1024 px. */
const ANALYSIS_GROUP: NavGroup = { label: "Análise", roles: ["admin"] };

export const APP_NAV_ITEMS: NavItem[] = [
	{ to: "/painel", label: "Painel", roles: ROLE_ACCESS.dashboard },
	{ to: "/projetos", label: "Meus Projetos", exact: true, roles: ["user"] },
	{ to: "/projetos/novo", label: "Novo Projeto", exact: true, roles: ["user"] },
	{ to: "/projetos", label: "Projetos", exact: true, roles: ["admin"] },
	{
		to: "/fila-de-analise",
		label: "Fila de Análise",
		roles: ROLE_ACCESS.reviewQueue,
		group: ANALYSIS_GROUP,
	},
	{
		to: "/distribuicao",
		label: "Distribuição",
		roles: ROLE_ACCESS.distribution,
		group: ANALYSIS_GROUP,
	},
	{
		to: "/indicadores",
		label: "Indicadores",
		roles: ROLE_ACCESS.reviewIndicators,
		group: ANALYSIS_GROUP,
	},
	{
		to: "/meus-pareceres",
		label: "Meus Pareceres",
		roles: ROLE_ACCESS.myReviews,
		group: ANALYSIS_GROUP,
	},
	{
		to: "/tabelas-normativas",
		label: "Tabelas Normativas",
		roles: ROLE_ACCESS.normativeTables,
	},
	{ to: "/usuarios", label: "Usuários", roles: ROLE_ACCESS.users },
];

export const filterNavItemsByRole = (
	items: NavItem[],
	role: UserRole | undefined,
): NavItem[] =>
	items.filter((item) => !item.roles || (role && item.roles.includes(role)));

export type NavEntry =
	| { kind: "item"; item: NavItem }
	| { kind: "group"; label: string; items: NavItem[] };

/** The header's entries for a role: a group sits where its first item would. */
export const groupNavItemsByRole = (
	items: NavItem[],
	role: UserRole | undefined,
): NavEntry[] =>
	filterNavItemsByRole(items, role).reduce<NavEntry[]>((entries, item) => {
		const group =
			item.group && role && item.group.roles.includes(role)
				? item.group
				: undefined;

		if (!group) return [...entries, { kind: "item", item }];

		const existing = entries.find(
			(entry) => entry.kind === "group" && entry.label === group.label,
		);

		if (existing?.kind === "group") {
			existing.items.push(item);
			return entries;
		}

		return [...entries, { kind: "group", label: group.label, items: [item] }];
	}, []);
