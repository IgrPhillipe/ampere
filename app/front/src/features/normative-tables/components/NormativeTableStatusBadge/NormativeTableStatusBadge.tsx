import { Badge } from "@components/ui/badge";
import { cn } from "@lib/utils";
import type { NormativeTableStatus } from "@services/normative-tables";

import {
	normativeTableStatusBadgeVariants,
	normativeTableStatusLabels,
} from "../../constants";

/** Ink while it waits for a review, then it recedes. */
const toneClassNames = {
	DRAFT: "text-foreground",
	PUBLISHED: "text-muted-foreground",
	SUPERSEDED: "text-faint-foreground",
} as const satisfies Record<NormativeTableStatus, string>;

interface NormativeTableStatusBadgeProps {
	status: NormativeTableStatus;
	className?: string;
}

export const NormativeTableStatusBadge = ({
	status,
	className,
}: NormativeTableStatusBadgeProps) => (
	<Badge
		variant={normativeTableStatusBadgeVariants[status]}
		className={cn(toneClassNames[status], className)}
	>
		{normativeTableStatusLabels[status]}
	</Badge>
);
