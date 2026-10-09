import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import { cn } from "@lib/utils";

function Tooltip(props: TooltipPrimitive.Root.Props) {
	return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger({
	delay = 200,
	...props
}: TooltipPrimitive.Trigger.Props) {
	return (
		<TooltipPrimitive.Trigger
			data-slot="tooltip-trigger"
			delay={delay}
			{...props}
		/>
	);
}

function TooltipContent({
	className,
	side = "top",
	sideOffset = 6,
	...props
}: TooltipPrimitive.Popup.Props &
	Pick<TooltipPrimitive.Positioner.Props, "side" | "sideOffset">) {
	return (
		<TooltipPrimitive.Portal>
			<TooltipPrimitive.Positioner side={side} sideOffset={sideOffset}>
				<TooltipPrimitive.Popup
					data-slot="tooltip-content"
					className={cn(
						"z-50 max-w-64 origin-(--transform-origin) rounded-sm bg-tooltip px-3 py-2 text-xs text-tooltip-foreground shadow-md backdrop-blur-sm transition-[transform,opacity] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0",
						className,
					)}
					{...props}
				/>
			</TooltipPrimitive.Positioner>
		</TooltipPrimitive.Portal>
	);
}

/** Standard tooltip text: the problem, the facts behind it, and what to do. */
interface TooltipMessage {
	title: string;
	details?: string[];
	action?: string;
}

function TooltipMessageContent({
	title,
	details = [],
	action,
}: TooltipMessage) {
	return (
		<div className="flex flex-col gap-1">
			<p className="font-semibold">{title}</p>
			{details.length > 0 ? (
				<ul className="flex list-disc flex-col gap-0.5 pl-4">
					{details.map((detail) => (
						<li key={detail}>{detail}</li>
					))}
				</ul>
			) : null}
			{action ? <p className="opacity-80">{action}</p> : null}
		</div>
	);
}

const tooltipMessageText = ({ title, details = [], action }: TooltipMessage) =>
	[title, ...details, action].filter(Boolean).join(". ");

export {
	Tooltip,
	TooltipContent,
	type TooltipMessage,
	TooltipMessageContent,
	TooltipTrigger,
	tooltipMessageText,
};
