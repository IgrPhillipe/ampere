import { Badge } from "@components/ui/badge";
import type { NormativeTableStatus } from "@services/normative-tables";

import {
	normativeTableStatusBadgeVariants,
	normativeTableStatusLabels,
} from "../../constants";

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
		className={className}
	>
		{normativeTableStatusLabels[status]}
	</Badge>
);
