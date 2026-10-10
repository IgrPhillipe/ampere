import { Button } from "@components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipMessageContent,
	TooltipTrigger,
} from "@components/ui/tooltip";
import { ArrowRight } from "lucide-react";

export const AnalyzeButton = () => (
	<Tooltip>
		<TooltipTrigger
			render={
				<Button
					type="button"
					size="xs"
					variant="outline"
					aria-disabled="true"
					onClick={(event) => event.preventDefault()}
				/>
			}
		>
			Analisar
			<ArrowRight aria-hidden="true" />
		</TooltipTrigger>
		<TooltipContent>
			<TooltipMessageContent
				title="Análise indisponível"
				action="A tela de conferência e apontamentos chega na próxima etapa."
			/>
		</TooltipContent>
	</Tooltip>
);
