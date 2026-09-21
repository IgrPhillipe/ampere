import { cn } from "@lib/utils";
import type { ReactNode } from "react";

interface FormActionsProps {
	children: ReactNode;
	className?: string;
}

/** Form action bar: right-aligned, reversed on mobile. */
export const FormActions = ({ children, className }: FormActionsProps) => (
	<div
		className={cn(
			"flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end",
			className,
		)}
	>
		{children}
	</div>
);
