import { CountCell } from "@components/CountCell";
import {
	Tooltip,
	TooltipContent,
	TooltipMessageContent,
	TooltipTrigger,
} from "@components/ui/tooltip";
import type { ReviewQueueItem } from "@services/review-queue";

import { formatWarnings } from "./review-queue-row";

interface AlertsCellProps {
	item: ReviewQueueItem;
}

/** The count, with what each pre-validation alert says one hover away. */
export const AlertsCell = ({ item }: AlertsCellProps) =>
	item.alerts.length > 0 ? (
		<Tooltip>
			<TooltipTrigger
				render={<span />}
				tabIndex={0}
				className="rounded-xs underline decoration-current/40 decoration-dotted underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
			>
				<CountCell count={item.alerts.length} />
			</TooltipTrigger>
			<TooltipContent className="max-w-80">
				<TooltipMessageContent
					title={formatWarnings(item.alerts.length)}
					details={item.alerts}
					action="Confira estes pontos durante a análise."
				/>
			</TooltipContent>
		</Tooltip>
	) : null;
