import { Select as SelectPrimitive } from "@base-ui/react/select";
import { cn } from "@lib/utils";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

/**
 * Diferenca importante em relacao ao Radix: o `SelectValue` do Base UI mostra
 * o **valor** selecionado, nao o texto do item. Passe `items` para o `Select`
 * e o rotulo aparece sozinho no gatilho.
 *
 * ```tsx
 * <Select items={{ a: "Opcao A", b: "Opcao B" }}>
 *   <SelectTrigger><SelectValue placeholder="Escolha" /></SelectTrigger>
 *   <SelectContent>
 *     <SelectItem value="a">Opcao A</SelectItem>
 *     <SelectItem value="b">Opcao B</SelectItem>
 *   </SelectContent>
 * </Select>
 * ```
 *
 * Sem `items`, o gatilho mostraria "b" em vez de "Opcao B".
 */
function Select<T>(props: SelectPrimitive.Root.Props<T>) {
	return <SelectPrimitive.Root {...props} />;
}

function SelectGroup(props: SelectPrimitive.Group.Props) {
	return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue(props: SelectPrimitive.Value.Props) {
	return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({
	className,
	children,
	...props
}: SelectPrimitive.Trigger.Props) {
	return (
		<SelectPrimitive.Trigger
			data-slot="select-trigger"
			className={cn(
				"flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-disabled:cursor-not-allowed data-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				className,
			)}
			{...props}
		>
			{children}

			<SelectPrimitive.Icon>
				<ChevronDownIcon className="size-4 opacity-50" />
			</SelectPrimitive.Icon>
		</SelectPrimitive.Trigger>
	);
}

function SelectContent({
	className,
	children,
	...props
}: SelectPrimitive.Popup.Props) {
	return (
		<SelectPrimitive.Portal>
			<SelectPrimitive.Positioner className="z-50" sideOffset={4}>
				<SelectPrimitive.Popup
					data-slot="select-content"
					className={cn(
						"max-h-(--available-height) min-w-(--anchor-width) origin-(--transform-origin) overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-none transition-[transform,opacity] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0",
						className,
					)}
					{...props}
				>
					{children}
				</SelectPrimitive.Popup>
			</SelectPrimitive.Positioner>
		</SelectPrimitive.Portal>
	);
}

function SelectItem({
	className,
	children,
	...props
}: SelectPrimitive.Item.Props) {
	return (
		<SelectPrimitive.Item
			data-slot="select-item"
			className={cn(
				"relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-accent data-highlighted:text-accent-foreground",
				className,
			)}
			{...props}
		>
			<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>

			<SelectPrimitive.ItemIndicator className="absolute right-2 flex size-3.5 items-center justify-center">
				<CheckIcon className="size-4" />
			</SelectPrimitive.ItemIndicator>
		</SelectPrimitive.Item>
	);
}

function SelectLabel({
	className,
	...props
}: SelectPrimitive.GroupLabel.Props) {
	return (
		<SelectPrimitive.GroupLabel
			data-slot="select-label"
			className={cn(
				"px-2 py-1.5 text-xs font-medium text-muted-foreground",
				className,
			)}
			{...props}
		/>
	);
}

export {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
};
