import { useRender } from "@base-ui/react/use-render";
import { cn } from "@lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

const badgeVariants = cva(
	"inline-flex min-h-6 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2.5 py-1 text-xs leading-none font-semibold whitespace-nowrap transition-[background-color,border-color,color,box-shadow] focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&>svg]:pointer-events-none [&>svg]:size-3",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
				secondary:
					"bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
				destructive:
					"border-destructive/20 bg-destructive/10 text-destructive focus-visible:ring-destructive/20 [a&]:hover:bg-destructive/15",
				outline:
					"border-primary/40 text-primary [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
				ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
				link: "text-primary underline-offset-4 [a&]:hover:underline",
				success:
					"border-primary/20 bg-accent text-accent-foreground [a&]:hover:bg-accent/80",
				warning:
					"border-warning/40 bg-warning/20 text-warning-foreground [a&]:hover:bg-warning/30",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

type BadgeProps = React.ComponentProps<"span"> &
	VariantProps<typeof badgeVariants> & {
		/** Troca o `<span>` por outro elemento. Equivale ao `asChild` do Radix. */
		render?: useRender.RenderProp;
	};

function Badge({
	className,
	variant = "default",
	render,
	...props
}: BadgeProps) {
	return useRender({
		render,
		defaultTagName: "span",
		props: {
			"data-slot": "badge",
			"data-variant": variant,
			className: cn(badgeVariants({ variant }), className),
			...props,
		},
	});
}

export { Badge, badgeVariants };
