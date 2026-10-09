import { cn } from "@lib/utils";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

interface InlineActionButtonProps {
	children: ReactNode;
	onClick: () => void;
	className?: string;
}

/** Text action inside a cell: "Ver Apontamentos", "Retomar e Enviar". */
export const InlineActionButton = ({
	children,
	onClick,
	className,
}: InlineActionButtonProps) => (
	<button
		type="button"
		onClick={onClick}
		className={cn(
			"inline-flex items-center gap-2 text-xs font-medium text-foreground underline decoration-current/40 underline-offset-4 transition-colors hover:decoration-current focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
			className,
		)}
	>
		{children}
		<ArrowRight className="size-3.5" aria-hidden="true" />
	</button>
);
