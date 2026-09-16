import type { LucideIcon } from "lucide-react";
import { InboxIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
	title: string;
	description?: ReactNode;
	icon?: LucideIcon;
	action?: ReactNode;
}

export const EmptyState = ({
	title,
	description,
	icon: Icon = InboxIcon,
	action,
}: EmptyStateProps) => (
	<div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed bg-background px-6 py-12 text-center">
		<Icon className="size-8 text-muted-foreground" />

		<div className="flex flex-col gap-1">
			<p className="font-medium text-foreground">{title}</p>

			{description ? (
				<p className="max-w-sm text-sm text-muted-foreground">{description}</p>
			) : null}
		</div>

		{action}
	</div>
);
