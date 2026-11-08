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
	<div className="flex min-h-64 flex-col items-center justify-center gap-5 px-6 py-16 text-center">
		<Icon className="size-6 text-faint-foreground" strokeWidth={1.5} />

		<div className="flex flex-col gap-3">
			<p className="text-lg font-medium text-foreground">{title}</p>

			{description ? (
				<p className="max-w-sm text-sm text-muted-foreground">{description}</p>
			) : null}
		</div>

		{action}
	</div>
);
