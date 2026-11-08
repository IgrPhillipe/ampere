import {
	Tooltip,
	TooltipContent,
	TooltipMessageContent,
	TooltipTrigger,
} from "@components/ui/tooltip";
import { padCount } from "@features/shared";
import type { ReviewQueueItem } from "@services/review-queue";

import { formatWarnings } from "./review-queue-row";

interface AlertsCellProps {
	item: ReviewQueueItem;
}

const versalete =
	"font-mono text-2xs tracking-[0.11em] whitespace-nowrap uppercase";

/** "02 alertas" in ink, with what each one says one hover away; "Sem alerta" faint. */
export const AlertsCell = ({ item }: AlertsCellProps) => {
	const count = item.alerts.length;

	if (count === 0) {
		return (
			<span className={`${versalete} text-faint-foreground`}>Sem alerta</span>
		);
	}

	return (
		<Tooltip>
			<TooltipTrigger
				render={<span />}
				tabIndex={0}
				className={`${versalete} text-foreground underline decoration-current/40 decoration-dotted underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none`}
			>
				{padCount(count)} {count === 1 ? "alerta" : "alertas"}
			</TooltipTrigger>
			<TooltipContent className="max-w-80">
				<TooltipMessageContent
					title={formatWarnings(count)}
					details={item.alerts}
					action="Confira estes pontos durante a análise."
				/>
			</TooltipContent>
		</Tooltip>
	);
};
