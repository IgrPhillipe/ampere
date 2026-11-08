import type { TooltipMessage } from "@components/ui/tooltip";

/** `critical` blocks the flow (rejected, overdue); `warning` can still wait a little. */
export interface AttentionMessage extends TooltipMessage {
	severity: "critical" | "warning";
}

/** State is told by form: ink text, never a colored fill. */
export const attentionSeverityClassNames = {
	critical: "text-foreground",
	warning: "text-foreground",
} as const satisfies Record<AttentionMessage["severity"], string>;
