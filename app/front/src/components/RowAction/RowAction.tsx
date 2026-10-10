import { InlineActionButton } from "@components/InlineActionButton";
import { Button } from "@components/ui/button";
import { ArrowRight } from "lucide-react";
import type { ComponentProps } from "react";

interface RowActionProps extends Omit<ComponentProps<"button">, "children"> {
	label: string;
	/** Filled when the row waits on the person; a text link when it is a lookup or can wait. */
	required: boolean;
	/** Width of the filled button; the link keeps its own width. */
	buttonClassName?: string;
}

export const RowAction = ({
	label,
	required,
	buttonClassName,
	className,
	...props
}: RowActionProps) =>
	required ? (
		<Button
			type="button"
			size="xs"
			className={buttonClassName ?? className}
			{...props}
		>
			{label}
			<ArrowRight aria-hidden="true" />
		</Button>
	) : (
		<InlineActionButton className={className} {...props}>
			{label}
		</InlineActionButton>
	);
