import { Button, buttonVariants } from "@components/ui/button";
import { cn } from "@lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import {
	type DayButton,
	DayPicker,
	getDefaultClassNames,
} from "react-day-picker";
import { ptBR } from "react-day-picker/locale";

function Calendar({
	className,
	classNames,
	showOutsideDays = true,
	components,
	...props
}: React.ComponentProps<typeof DayPicker>) {
	const defaults = getDefaultClassNames();

	return (
		<DayPicker
			locale={ptBR}
			showOutsideDays={showOutsideDays}
			className={cn("bg-popover p-3 [--cell-size:--spacing(9)]", className)}
			classNames={{
				root: cn("w-fit", defaults.root),
				months: cn("relative flex flex-col gap-4 md:flex-row", defaults.months),
				month: cn("flex w-full flex-col gap-4", defaults.month),
				nav: cn(
					"absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
					defaults.nav,
				),
				button_previous: cn(
					buttonVariants({ variant: "ghost", size: "icon-sm" }),
					"size-(--cell-size) select-none aria-disabled:opacity-50",
					defaults.button_previous,
				),
				button_next: cn(
					buttonVariants({ variant: "ghost", size: "icon-sm" }),
					"size-(--cell-size) select-none aria-disabled:opacity-50",
					defaults.button_next,
				),
				month_caption: cn(
					"flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
					defaults.month_caption,
				),
				caption_label: cn(
					"text-sm font-semibold select-none first-letter:uppercase",
					defaults.caption_label,
				),
				month_grid: "w-full border-collapse",
				weekdays: cn("flex", defaults.weekdays),
				weekday: cn(
					"flex-1 text-xs font-normal text-muted-foreground select-none",
					defaults.weekday,
				),
				week: cn("mt-1 flex w-full", defaults.week),
				day: cn(
					"group/day relative aspect-square size-(--cell-size) p-0 text-center select-none",
					defaults.day,
				),
				range_start: cn("rounded-l-xs bg-accent", defaults.range_start),
				range_middle: cn("rounded-none", defaults.range_middle),
				range_end: cn("rounded-r-xs bg-accent", defaults.range_end),
				today: cn("font-semibold text-primary", defaults.today),
				outside: cn("text-muted-foreground", defaults.outside),
				disabled: cn("text-muted-foreground opacity-50", defaults.disabled),
				hidden: cn("invisible", defaults.hidden),
				...classNames,
			}}
			components={{
				Chevron: ({ orientation, className: chevronClassName }) =>
					orientation === "left" ? (
						<ChevronLeft className={cn("size-4", chevronClassName)} />
					) : (
						<ChevronRight className={cn("size-4", chevronClassName)} />
					),
				DayButton: CalendarDayButton,
				...components,
			}}
			{...props}
		/>
	);
}

function CalendarDayButton({
	className,
	day,
	modifiers,
	...props
}: React.ComponentProps<typeof DayButton>) {
	const ref = React.useRef<HTMLButtonElement>(null);

	React.useEffect(() => {
		if (modifiers.focused) ref.current?.focus();
	}, [modifiers.focused]);

	return (
		<Button
			ref={ref}
			variant="ghost"
			size="icon-sm"
			data-selected-single={
				modifiers.selected &&
				!modifiers.range_start &&
				!modifiers.range_end &&
				!modifiers.range_middle
			}
			data-range-start={modifiers.range_start}
			data-range-end={modifiers.range_end}
			data-range-middle={modifiers.range_middle}
			className={cn(
				"size-(--cell-size) rounded-xs font-normal",
				"data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground",
				"data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground",
				"data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground",
				"data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground",
				className,
			)}
			{...props}
		/>
	);
}

export { Calendar };
