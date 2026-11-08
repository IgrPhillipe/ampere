import { InlineActionButton } from "@components/InlineActionButton";
import type { ComponentProps } from "react";

interface RowActionProps extends Omit<ComponentProps<"button">, "children"> {
	label: string;
	/** Kept for callers; the Figma draws every row action as the same text link. */
	required: boolean;
	buttonClassName?: string;
}

export const RowAction = ({
	label,
	required: _required,
	buttonClassName: _buttonClassName,
	className,
	...props
}: RowActionProps) => (
	<InlineActionButton className={className} {...props}>
		{label}
	</InlineActionButton>
);
