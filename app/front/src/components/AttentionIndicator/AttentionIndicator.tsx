import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@components/ui/tooltip";
import { cn } from "@lib/utils";
import { CircleAlert } from "lucide-react";

interface AttentionIndicatorProps {
	label: string;
	className?: string;
}

export const AttentionIndicator = ({
	label,
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
			<span className="sr-only">{label}</span>
		</TooltipTrigger>
		<TooltipContent>{label}</TooltipContent>
	</Tooltip>
);
