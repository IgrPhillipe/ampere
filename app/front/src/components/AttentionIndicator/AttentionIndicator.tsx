import {
	Tooltip,
	TooltipContent,
	TooltipMessageContent,
	TooltipTrigger,
	tooltipMessageText,
} from "@components/ui/tooltip";
import { cn } from "@lib/utils";

import type { AttentionMessage } from "./attention-severity";

interface AttentionIndicatorProps {
	message: AttentionMessage;
	className?: string;
}

export const AttentionIndicator = ({
	message,
	className,
}: AttentionIndicatorProps) => (
	<Tooltip>
		<TooltipTrigger
			render={<span />}
			tabIndex={0}
			className={cn(
				// The Figma's gutter mark: a 2px bar flags only the rows that need action.
				"inline-flex h-9 w-2 items-stretch justify-start focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
				className,
			)}
		>
			<span
				aria-hidden="true"
				className={cn(
					"w-0.5 bg-attention",
					message.severity === "warning" && "bg-attention/60",
				)}
			/>
			<span className="sr-only">{tooltipMessageText(message)}</span>
		</TooltipTrigger>
		<TooltipContent>
			<TooltipMessageContent
				title={message.title}
				details={message.details}
				action={message.action}
			/>
		</TooltipContent>
	</Tooltip>
);
