import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { cn } from "@lib/utils";
import { CheckIcon, SearchIcon } from "lucide-react";
import type * as React from "react";

const Combobox = ComboboxPrimitive.Root;

function ComboboxTrigger(props: ComboboxPrimitive.Trigger.Props) {
	return <ComboboxPrimitive.Trigger data-slot="combobox-trigger" {...props} />;
}

/** Popup with the search field on top, the list below and an optional footer. */
function ComboboxContent({
	className,
	searchPlaceholder,
	emptyMessage,
	footer,
	children,
	...props
}: Omit<ComboboxPrimitive.Popup.Props, "children"> & {
	searchPlaceholder: string;
	emptyMessage: string;
	footer?: React.ReactNode;
	children: ComboboxPrimitive.List.Props["children"];
}) {
	return (
		<ComboboxPrimitive.Portal>
			<ComboboxPrimitive.Positioner
				align="start"
				sideOffset={4}
				className="z-50"
			>
				<ComboboxPrimitive.Popup
					data-slot="combobox-content"
					className={cn(
						"flex max-h-(--available-height) w-72 max-w-(--available-width) origin-(--transform-origin) flex-col overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md outline-none transition-[transform,opacity] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0",
						className,
					)}
					{...props}
				>
					<div className="relative border-b border-border">
						<SearchIcon
							aria-hidden="true"
							className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
						/>
						<ComboboxPrimitive.Input
							placeholder={searchPlaceholder}
							className="h-10 w-full bg-transparent pr-3 pl-9 text-base outline-none placeholder:text-muted-foreground md:text-sm"
						/>
					</div>
					<ComboboxPrimitive.Empty className="px-3 py-3 text-sm text-muted-foreground empty:hidden">
						{emptyMessage}
					</ComboboxPrimitive.Empty>
					<ComboboxPrimitive.List className="max-h-64 overflow-y-auto overscroll-contain p-1 empty:hidden">
						{children}
					</ComboboxPrimitive.List>
					{footer ? (
						<div className="border-t border-border p-1">{footer}</div>
					) : null}
				</ComboboxPrimitive.Popup>
			</ComboboxPrimitive.Positioner>
		</ComboboxPrimitive.Portal>
	);
}

function ComboboxItem({
	className,
	children,
	...props
}: ComboboxPrimitive.Item.Props) {
	return (
		<ComboboxPrimitive.Item
			data-slot="combobox-item"
			className={cn(
				"relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-accent data-highlighted:text-accent-foreground",
				className,
			)}
			{...props}
		>
			<span className="absolute left-2 flex size-4 items-center justify-center">
				<ComboboxPrimitive.ItemIndicator>
					<CheckIcon className="size-4" />
				</ComboboxPrimitive.ItemIndicator>
			</span>
			{children}
		</ComboboxPrimitive.Item>
	);
}

export { Combobox, ComboboxContent, ComboboxItem, ComboboxTrigger };
