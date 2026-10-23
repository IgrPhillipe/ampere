import { Badge } from "@components/ui/badge";
import type { Finding } from "@services/project-review";
import { MessageSquareWarning } from "lucide-react";

interface FindingBadgeProps {
	findings?: Finding[];
	className?: string;
}

export const FindingBadge = ({
	findings = [],
	className,
}: FindingBadgeProps) => {
	const active = findings.filter(
		({ status }) => status !== "DRAFT" && status !== "RESOLVED",
	);
	if (active.length === 0) return null;

	const hasBlocking = active.some(({ severity }) => severity === "BLOCKING");

	return (
		<Badge
			variant={hasBlocking ? "destructive" : "warning"}
			className={className}
			title={`${active.length} ${active.length === 1 ? "apontamento" : "apontamentos"} nesta etapa`}
		>
			<MessageSquareWarning aria-hidden="true" />
			{active.length} {active.length === 1 ? "apontamento" : "apontamentos"}
		</Badge>
	);
};
