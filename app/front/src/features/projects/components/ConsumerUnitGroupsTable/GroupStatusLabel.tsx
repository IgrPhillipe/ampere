import { cn } from "@lib/utils";
import type { GroupStatus } from "@services/consumer-units";

import { groupStatusLabels } from "../../constants";

interface GroupStatusLabelProps {
	status: GroupStatus;
	className?: string;
}

/**
 * Situacao em caixa alta mono, como na listagem de projetos e no prototipo:
 * nao e badge. O que ja esta validado recua para o tom secundario.
 */
export const GroupStatusLabel = ({
	status,
	className,
}: GroupStatusLabelProps) => (
	<span
		className={cn(
			"font-mono text-xs tracking-[0.08em] uppercase",
			status === "VALIDATED" ? "text-muted-foreground" : "text-foreground",
			className,
		)}
	>
		{groupStatusLabels[status]}
	</span>
);
