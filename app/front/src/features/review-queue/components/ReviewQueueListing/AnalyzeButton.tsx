import { InlineActionButton } from "@components/InlineActionButton";
import {
	Tooltip,
	TooltipContent,
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
			A análise individual estará disponível em uma próxima etapa.
		</TooltipContent>
	</Tooltip>
);
