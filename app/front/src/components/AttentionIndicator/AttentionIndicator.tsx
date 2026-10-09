import {
	Tooltip,
	TooltipContent,
	type TooltipMessage,
	TooltipMessageContent,
	TooltipTrigger,
	tooltipMessageText,
} from "@components/ui/tooltip";
import { cn } from "@lib/utils";
import { CircleAlert } from "lucide-react";

interface AttentionIndicatorProps {
	message: TooltipMessage;
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
				"inline-flex size-6 items-center justify-center rounded-full bg-brand-sunset/20 text-warning-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
				className,
			)}
		>
			<CircleAlert className="size-3.5" aria-hidden="true" />
			<span className="sr-only">{tooltipMessageText(message)}</span>
		</TooltipTrigger>
		<TooltipContent>
			<TooltipMessageContent {...message} />
		</TooltipContent>
	</Tooltip>
);
