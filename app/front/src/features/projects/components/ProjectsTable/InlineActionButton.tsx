import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

interface InlineActionButtonProps {
	children: ReactNode;
	onClick: () => void;
}

/** Acao textual de dentro de uma celula: "Ver apontamentos", "Retomar e enviar". */
export const InlineActionButton = ({
	children,
	onClick,
}: InlineActionButtonProps) => (
	<button
		type="button"
		onClick={onClick}
		className="inline-flex items-center gap-2 text-xs text-foreground underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
	>
		{children}
		<ArrowRight className="size-3.5" aria-hidden="true" />
	</button>
);
