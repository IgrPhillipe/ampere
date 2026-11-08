import { cn } from "@lib/utils";
import { ArrowRight } from "lucide-react";
import type { ComponentProps } from "react";

/** Text action inside a cell: "Ver Apontamentos", "Retomar e Enviar". */
export const InlineActionButton = ({
	children,
	className,
	...props
}: ComponentProps<"button">) => (
	<button
		type="button"
		className={cn(
			"inline-flex items-center gap-2 text-[0.8125rem] font-medium whitespace-nowrap text-foreground underline-offset-4 transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
			className,
		)}
		{...props}
	>
		{children}
		<ArrowRight className="size-3.5" aria-hidden="true" />
	</button>
);
