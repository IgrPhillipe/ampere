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
	<div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-md border border-dashed border-border bg-card px-6 py-16 text-center">
		<div className="flex size-12 items-center justify-center rounded-full bg-accent">
			<Icon className="size-6 text-accent-foreground" />
		</div>

		<div className="flex flex-col gap-2">
			<p className="text-base font-semibold text-foreground">{title}</p>

			{description ? (
				<p className="max-w-sm text-sm text-muted-foreground">{description}</p>
			) : null}
		</div>

		{action}
	</div>
);
