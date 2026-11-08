import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";
import type { ComponentProps, ReactNode } from "react";

interface ListMenuButtonProps extends ComponentProps<typeof Button> {
	/** Marks the button while it narrows the list. */
	active?: boolean;
}

/** Quiet filter trigger of the Figma: mono versalete over a 1px rule, no fill. */
export const ListMenuButton = ({
	active = false,
	className,
	...props
}: ListMenuButtonProps) => (
	<Button
		type="button"
		size="xs"
		variant="neutral"
		className={cn(
			"shrink-0 gap-2 border-border bg-transparent px-3 font-mono text-2xs font-normal tracking-[0.11em] uppercase hover:border-border-strong hover:bg-transparent aria-expanded:border-foreground",
			active && "border-foreground hover:border-foreground",
			className,
		)}
		{...props}
	/>
);

interface ListMenuButtonTextProps {
	label: string;
	value: string;
	icon: ReactNode;
}

export const ListMenuButtonText = ({
	label,
	value,
	icon,
}: ListMenuButtonTextProps) => (
	<>
		<span className="text-faint-foreground">{label}</span>
		<span className="max-w-48 truncate font-medium text-foreground">
			{value}
		</span>
		{icon}
	</>
);
