import { cn } from "@lib/utils";
import type { GroupStatus } from "@services/consumer-units";

import { groupStatusLabels } from "../../constants";

interface GroupStatusLabelProps {
	status: GroupStatus;
	className?: string;
}

export const GroupStatusLabel = ({
	status,
	className,
}: GroupStatusLabelProps) => (
	<span
		className={cn(
			"font-mono text-2xs tracking-[0.11em] uppercase",
			status === "VALIDATED" ? "text-faint-foreground" : "text-foreground",
			className,
		)}
	>
		{groupStatusLabels[status]}
	</span>
);
