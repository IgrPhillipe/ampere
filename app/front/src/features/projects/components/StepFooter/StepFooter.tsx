import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

interface StepFooterProps {
	/** The step before this one; the first step has none. */
	previous?: { label: string; onClick: () => void };
	children?: ReactNode;
	className?: string;
}

/** On small screens the actions stack full width, the next step on top. */
export const StepFooter = ({
	previous,
	children,
	className,
}: StepFooterProps) => (
	<div
		className={cn(
			"flex flex-col-reverse gap-3 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between md:px-8",
			className,
		)}
	>
		{previous ? (
			<Button
				type="button"
				variant="outline"
				className="w-full sm:w-auto"
				onClick={previous.onClick}
			>
				<ArrowLeft aria-hidden="true" />
				{previous.label}
			</Button>
		) : (
			<span aria-hidden="true" className="hidden sm:block" />
		)}

		<div className="flex flex-col-reverse gap-2 *:w-full sm:flex-row sm:items-center sm:*:w-auto">
			{children}
		</div>
	</div>
);
