import type { TooltipMessage } from "@components/ui/tooltip";

/** `critical` blocks the flow (rejected, overdue); `warning` can still wait a little. */
export interface AttentionMessage extends TooltipMessage {
	severity: "critical" | "warning";
}

export const attentionSeverityClassNames = {
	critical: "bg-destructive/10 text-destructive",
	warning: "bg-brand-sunset/20 text-warning-foreground",
} as const satisfies Record<AttentionMessage["severity"], string>;
