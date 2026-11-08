import { Badge } from "@components/ui/badge";
import { cn } from "@lib/utils";

import { userStatusLabels } from "../../constants";
import {
	getUserAttention,
	hasTemporaryPassword,
	type UserState,
} from "./user-attention";

interface UserStatusBadgeProps {
	user: UserState;
	className?: string;
}

/** Versalete without color: ink when it asks for action, faint when the account is fine. */
export const UserStatusBadge = ({ user, className }: UserStatusBadgeProps) => {
	const label = hasTemporaryPassword(user)
		? "Senha Temporária"
		: userStatusLabels[user.active ? "active" : "inactive"];

	return (
		<Badge
			className={cn(
				getUserAttention(user) ? "text-foreground" : "text-faint-foreground",
				className,
			)}
		>
			{label}
		</Badge>
	);
};
