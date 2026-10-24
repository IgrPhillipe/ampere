import { cn } from "@lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const textareaVariants = cva(
	"flex field-sizing-content min-h-24 w-full text-base text-foreground transition-[border-color,box-shadow] outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:text-disabled-foreground md:text-sm",
	{
		variants: {
			variant: {
				default:
					"rounded-sm border border-input bg-card px-4 py-3 shadow-sm hover:border-primary/60 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:border-disabled disabled:bg-disabled aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
				underline:
					"rounded-none border-0 border-b-2 border-input bg-transparent px-0 py-2 shadow-none hover:border-primary/60 focus-visible:border-ring focus-visible:ring-0 disabled:border-disabled aria-invalid:border-destructive aria-invalid:ring-0",
			},
		},
		defaultVariants: {
			variant: "underline",
		},
	},
);

type TextareaProps = React.ComponentProps<"textarea"> &
	VariantProps<typeof textareaVariants>;

function Textarea({ className, variant, ...props }: TextareaProps) {
	return (
		<textarea
			data-slot="textarea"
			className={cn(textareaVariants({ variant }), className)}
			{...props}
		/>
	);
}

export { Textarea };
