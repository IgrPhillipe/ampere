import { cn } from "@lib/utils";
import type { ReactNode } from "react";

interface FormActionsProps {
	children: ReactNode;
	/** `start` puts the primary first with a text link beside it, as on the access screens. */
	align?: "start" | "end";
	className?: string;
}

export const FormActions = ({
	children,
	align = "end",
	className,
}: FormActionsProps) => (
	<div
		className={cn(
			align === "start"
				? "flex flex-wrap items-center gap-x-5 gap-y-3 pt-3"
				: "flex flex-col-reverse gap-3 sm:flex-row sm:justify-end",
			className,
		)}
	>
		{children}
	</div>
);
