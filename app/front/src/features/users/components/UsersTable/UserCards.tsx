import { cn } from "@lib/utils";
import type { ManagedUser } from "@services/users";

import { UserRoleBadge } from "../UserRoleBadge";
import { type UserRowActionHandlers, UserRowActions } from "../UserRowActions";
import { getUserAttention, UserStatusBadge } from "../UserStatusBadge";
import { LastAccessCell } from "./LastAccessCell";
import { UserIdentity } from "./UserIdentity";

interface UserCardsProps {
	users: ManagedUser[];
	currentUserId: string | undefined;
	actions?: UserRowActionHandlers;
	className?: string;
}

export const UserCards = ({
	users,
	currentUserId,
	actions,
	className,
}: UserCardsProps) => (
	<ul className={cn("flex flex-col bg-card", className)}>
		{users.map((user) => (
			<li
				key={user.id}
				className={cn(
					"flex items-start gap-3 border-b border-border px-6 py-4 last:border-b-0",
					getUserAttention(user) && "border-l-2 border-l-attention",
				)}
			>
				<div className="flex min-w-0 flex-1 flex-col gap-3">
					<UserIdentity user={user} isCurrentUser={user.id === currentUserId} />

					<div className="flex flex-wrap items-center gap-3">
						<UserRoleBadge role={user.role} />
						<UserStatusBadge user={user} />
					</div>

					<div className="flex flex-wrap items-baseline gap-x-1.5 text-xs text-muted-foreground">
						<span>Último acesso:</span>
						<LastAccessCell
							value={user.lastLoginAt}
							className="text-xs whitespace-nowrap"
						/>
					</div>

					{actions ? (
						<UserRowActions
							user={user}
							isCurrentUser={user.id === currentUserId}
							className="justify-start"
							{...actions}
						/>
					) : null}
				</div>
			</li>
		))}
	</ul>
);
