import { Badge } from "@components/ui/badge";
import type { Finding } from "@services/project-review";
import { MessageSquareWarning } from "lucide-react";
import { useEffect, useRef } from "react";

interface FindingBadgeProps {
	findings?: Finding[];
	/** Item the findings shortcut points to, matched against the URL hash. */
	target?: string;
	className?: string;
}

export const FindingBadge = ({
	findings = [],
	target,
	className,
}: FindingBadgeProps) => {
	const ref = useRef<HTMLSpanElement>(null);
	const count = findings.length;

	useEffect(() => {
		const badge = ref.current;
		// The same group renders as a card and as a row: only the visible one scrolls.
		if (!target || !badge?.offsetParent) return;
		if (window.location.hash === `#${target}`) {
			badge.scrollIntoView({ block: "center" });
		}
	}, [target, count]);

	if (count === 0) return null;

	return (
		<Badge
			ref={ref}
			variant={
				findings.some(({ severity }) => severity === "BLOCKING")
					? "destructive"
					: "warning"
			}
			className={className}
		>
			<MessageSquareWarning aria-hidden="true" />
			{count} {count === 1 ? "Apontamento" : "Apontamentos"}
		</Badge>
	);
};
