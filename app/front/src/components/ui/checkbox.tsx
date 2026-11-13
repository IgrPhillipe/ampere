import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { cn } from "@lib/utils";
import { CheckIcon, MinusIcon } from "lucide-react";

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
	return (
		<CheckboxPrimitive.Root
			data-slot="checkbox"
			className={cn(
				"peer group/checkbox inline-flex size-5 shrink-0 items-center justify-center rounded-xs border border-input bg-card shadow-sm transition-[background-color,border-color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:border-disabled disabled:bg-disabled data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground data-indeterminate:border-primary data-indeterminate:bg-primary data-indeterminate:text-primary-foreground data-invalid:border-destructive data-invalid:ring-2 data-invalid:ring-destructive/20",
				className,
			)}
			{...props}
		>
			<CheckboxPrimitive.Indicator
				data-slot="checkbox-indicator"
				className="flex items-center justify-center text-current transition-none"
			>
				<CheckIcon className="size-4 group-data-indeterminate/checkbox:hidden" />
				<MinusIcon className="hidden size-4 group-data-indeterminate/checkbox:block" />
			</CheckboxPrimitive.Indicator>
		</CheckboxPrimitive.Root>
	);
}

export { Checkbox };
