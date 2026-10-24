import {
	Tooltip,
	TooltipContent,
	TooltipMessageContent,
	TooltipTrigger,
	tooltipMessageText,
} from "@components/ui/tooltip";
import { cn } from "@lib/utils";
import { CircleAlert } from "lucide-react";

import {
	type AttentionMessage,
	attentionSeverityClassNames,
} from "./attention-severity";

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
				"inline-flex size-6 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
				attentionSeverityClassNames[message.severity],
				className,
			)}
		>
			<CircleAlert className="size-3.5" aria-hidden="true" />
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
