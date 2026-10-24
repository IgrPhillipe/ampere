import { Badge } from "@components/ui/badge";
import { padCount } from "@features/shared";
import { cn } from "@lib/utils";
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

	// The badge is the status; the count stays a mono number beside it.
	return (
		<span ref={ref} className={cn("inline-flex items-center gap-2", className)}>
			<Badge
				variant={
					findings.some(({ severity }) => severity === "BLOCKING")
						? "destructive"
						: "warning"
				}
			>
				<MessageSquareWarning aria-hidden="true" />
				Apontamento
			</Badge>
			{count > 1 ? (
				<span className="font-mono text-xs text-muted-foreground">
					{padCount(count)}
					<span className="sr-only"> apontamentos</span>
				</span>
			) : null}
		</span>
	);
};
