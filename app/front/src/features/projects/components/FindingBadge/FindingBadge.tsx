import { AttentionIndicator } from "@components/AttentionIndicator";
import { cn } from "@lib/utils";
import type { Finding } from "@services/project-review";
import { useEffect, useRef } from "react";

import { getFindingAttention } from "../../constants";

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
		const marker = ref.current;
		// The same group renders as a card and as a row: only the visible one scrolls.
		if (!target || !marker?.offsetParent) return;
		if (window.location.hash === `#${target}`) {
			marker.scrollIntoView({ block: "center" });
		}
	}, [target, count]);

	if (count === 0) return null;

	return (
		<span ref={ref} className={cn("inline-flex", className)}>
			<AttentionIndicator message={getFindingAttention(findings)} />
		</span>
	);
};
