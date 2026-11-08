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

/** The Figma's footer: a 40px square back arrow, the step's primary on the right. */
export const StepFooter = ({
	previous,
	children,
	className,
}: StepFooterProps) => (
	<div
		className={cn(
			"flex items-center justify-between gap-3 border-t border-border px-6 py-4 md:px-10",
			className,
		)}
	>
		{previous ? (
			<Button
				type="button"
				variant="outline"
				size="icon"
				aria-label={previous.label}
				title={`Voltar para ${previous.label}`}
				className="size-10 shrink-0 border-border-strong"
				onClick={previous.onClick}
			>
				<ArrowLeft aria-hidden="true" />
			</Button>
		) : (
			<span aria-hidden="true" />
		)}

		<div className="flex min-w-0 flex-wrap items-center justify-end gap-x-5 gap-y-2">
			{children}
		</div>
	</div>
);
