import type { ManagedUser } from "@services/users";

interface UserIdentityProps {
	user: Pick<ManagedUser, "name" | "email">;
	isCurrentUser: boolean;
}

export const UserIdentity = ({ user, isCurrentUser }: UserIdentityProps) => (
	<div className="flex min-w-0 flex-col gap-1 whitespace-normal">
		<span className="font-semibold text-foreground">
			{user.name}
			{isCurrentUser ? (
				<span className="font-normal text-muted-foreground"> (você)</span>
			) : null}
		</span>
		<span className="text-xs break-all text-muted-foreground">
			{user.email}
		</span>
	</div>
);
