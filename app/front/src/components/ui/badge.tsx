import { useRender } from "@base-ui/react/use-render";
import { cn } from "@lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

/**
 * Status in the Figma is mono small caps text, never a colored pill: tone and
 * weight carry the state, and the gutter bar marks what needs action.
 */
const badgeVariants = cva(
	"inline-flex w-fit shrink-0 items-center gap-1.5 overflow-hidden border border-transparent font-mono text-2xs leading-none font-normal tracking-[0.11em] whitespace-nowrap uppercase transition-colors focus-visible:ring-2 focus-visible:ring-ring/30 [&>svg]:pointer-events-none [&>svg]:size-3",
	{
		variants: {
			variant: {
				default: "text-foreground",
				secondary: "text-foreground",
				destructive: "font-medium text-foreground",
				outline: "text-foreground",
				ghost: "text-muted-foreground",
				link: "text-foreground underline-offset-4 [a&]:hover:underline",
				success: "text-foreground",
				warning: "font-medium text-foreground",
				info: "text-foreground",
				neutral: "text-faint-foreground",
				tag: "border-border px-2 py-1 text-muted-foreground",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

type BadgeProps = React.ComponentProps<"span"> &
	VariantProps<typeof badgeVariants> & {
		/** Swaps the `<span>` for another element. Equivalent to Radix's `asChild`. */
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

export { Badge, type BadgeProps, badgeVariants };
