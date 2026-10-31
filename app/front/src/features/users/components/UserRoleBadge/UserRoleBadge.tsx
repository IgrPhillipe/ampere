import { Badge } from "@components/ui/badge";
import type { UserRole } from "@features/shared";

import { userRoleBadgeVariants, userRoleLabels } from "../../constants";

interface UserRoleBadgeProps {
	role: UserRole;
	className?: string;
}

export const UserRoleBadge = ({ role, className }: UserRoleBadgeProps) => (
	<Badge variant={userRoleBadgeVariants[role]} className={className}>
		{userRoleLabels[role]}
	</Badge>
);
