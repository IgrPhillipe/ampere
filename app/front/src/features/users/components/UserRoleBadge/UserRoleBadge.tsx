import { Badge } from "@components/ui/badge";
import type { UserRole } from "@features/shared";
import { cn } from "@lib/utils";

import { userRoleLabels } from "../../constants";

interface UserRoleBadgeProps {
	role: UserRole;
	className?: string;
}

export const UserRoleBadge = ({ role, className }: UserRoleBadgeProps) => (
	<Badge className={cn("text-muted-foreground", className)}>
		{userRoleLabels[role]}
	</Badge>
);
