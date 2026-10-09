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
						"z-50 max-w-60 origin-(--transform-origin) rounded-xs bg-secondary px-3 py-2 text-xs text-secondary-foreground shadow-md transition-[transform,opacity] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0",
						className,
					)}
					{...props}
				/>
			</TooltipPrimitive.Positioner>
		</TooltipPrimitive.Portal>
	);
}

export { Tooltip, TooltipContent, TooltipTrigger };
