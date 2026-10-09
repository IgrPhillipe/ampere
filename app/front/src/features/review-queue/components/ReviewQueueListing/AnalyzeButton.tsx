import { InlineActionButton } from "@components/InlineActionButton";
import {
	Tooltip,
	TooltipContent,
	TooltipMessageContent,
	TooltipTrigger,
} from "@components/ui/tooltip";

export const AnalyzeButton = () => (
	<Tooltip>
		<TooltipTrigger
			render={
				<InlineActionButton
					aria-disabled="true"
					onClick={(event) => event.preventDefault()}
				/>
			}
		>
			Analisar
		</TooltipTrigger>
		<TooltipContent>
			<TooltipMessageContent
				title="Análise indisponível"
				action="A tela de conferência e apontamentos chega na próxima etapa."
			/>
		</TooltipContent>
	</Tooltip>
);
