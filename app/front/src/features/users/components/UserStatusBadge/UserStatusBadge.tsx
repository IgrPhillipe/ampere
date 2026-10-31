import { Badge } from "@components/ui/badge";
import { cn } from "@lib/utils";
import type { ManagedUser } from "@services/users";

import { userStatusLabels } from "../../constants";

interface UserStatusBadgeProps {
	user: Pick<ManagedUser, "active" | "mustChangePassword">;
	className?: string;
}

/** A pending change only matters while the account can still sign in. */
export const UserStatusBadge = ({ user, className }: UserStatusBadgeProps) => (
	<div className={cn("flex flex-wrap items-center gap-1.5", className)}>
		<Badge variant={user.active ? "success" : "neutral"}>
			{userStatusLabels[user.active ? "active" : "inactive"]}
		</Badge>

		{user.active && user.mustChangePassword ? (
			<Badge variant="warning">Troca Pendente</Badge>
		) : null}
	</div>
);
