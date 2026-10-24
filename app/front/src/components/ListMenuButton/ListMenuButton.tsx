import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";
import type { ComponentProps, ReactNode } from "react";

interface ListMenuButtonProps extends ComponentProps<typeof Button> {
	/** Highlights the button while it narrows the list. */
	active?: boolean;
}

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
			"shrink-0 gap-2 font-mono font-normal tracking-wider uppercase",
			active && "border-primary bg-accent text-accent-foreground",
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
		<span className="text-muted-foreground">{label}</span>
		<span className="max-w-56 truncate font-semibold">{value}</span>
		{icon}
	</>
);
