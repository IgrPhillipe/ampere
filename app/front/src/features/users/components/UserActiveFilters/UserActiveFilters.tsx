import { type ActiveFilter, ActiveFilters } from "@components/ActiveFilters";

import { userRoleLabels, userStatusLabels } from "../../constants";
import type { UserFilters } from "../../hooks";

interface UserActiveFiltersProps {
	filters: UserFilters;
}

export const UserActiveFilters = ({ filters }: UserActiveFiltersProps) => {
	const { search, role, status, mustChangePassword, inactiveDays } = filters;
	const active: ActiveFilter[] = [];

	if (search.trim()) {
		active.push({
			id: "search",
			label: `Busca: ${search.trim()}`,
			onRemove: () => filters.setSearch(""),
		});
	}

	if (role) {
		active.push({
			id: "role",
			label: `Papel: ${userRoleLabels[role]}`,
			onRemove: () => filters.setRole(null),
		});
	}

	if (status) {
		active.push({
			id: "status",
			label: `Situação: ${userStatusLabels[status]}`,
			onRemove: () => filters.setStatus(null),
		});
	}

	if (mustChangePassword) {
		active.push({
			id: "mustChangePassword",
			label: "Troca de senha pendente",
			onRemove: () => filters.setMustChangePassword(null),
		});
	}

	if (inactiveDays) {
		active.push({
			id: "inactiveDays",
			label: `Sem acesso há mais de ${inactiveDays} dias`,
			onRemove: () => filters.setInactiveDays(null),
		});
	}

	return <ActiveFilters filters={active} onClear={filters.clearFilters} />;
};
