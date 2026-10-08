import { Button } from "@components/ui/button";
import { ArrowRight } from "lucide-react";
import { useId } from "react";

export const AnalyzeButton = () => {
	const tooltipId = useId();

	return (
		<span className="group relative inline-flex">
			<Button
				type="button"
				variant="link"
				size="xs"
				aria-disabled="true"
				aria-describedby={tooltipId}
				title="A análise individual estará disponível em uma próxima etapa"
				onClick={(event) => event.preventDefault()}
				className="text-[#1e1a13] hover:text-[#1e1a13]"
			>
				Analisar
				<ArrowRight aria-hidden="true" />
			</Button>
			<span
				id={tooltipId}
				role="tooltip"
				className="pointer-events-none absolute right-0 bottom-full z-20 mb-2 w-60 rounded-xs bg-secondary px-3 py-2 text-xs text-secondary-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
			>
				A análise individual estará disponível em uma próxima etapa.
			</span>
		</span>
	);
};
