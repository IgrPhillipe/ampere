import { RowAction } from "@components/RowAction";
import {
	Tooltip,
	TooltipContent,
	TooltipMessageContent,
	TooltipTrigger,
} from "@components/ui/tooltip";

interface AnalyzeButtonProps {
	/** Overdue or due today: a filled button. Otherwise it can wait, so a link. */
	urgent: boolean;
	buttonClassName?: string;
}

export const AnalyzeButton = ({
	urgent,
	buttonClassName,
}: AnalyzeButtonProps) => (
	<Tooltip>
		<TooltipTrigger
			render={
				<RowAction
					label="Analisar"
					required={urgent}
					buttonClassName={buttonClassName}
					aria-disabled="true"
					onClick={(event) => event.preventDefault()}
				/>
			}
		/>
		<TooltipContent>
			<TooltipMessageContent
				title="Análise indisponível"
				action="A tela de conferência e apontamentos chega na próxima etapa."
			/>
		</TooltipContent>
	</Tooltip>
);
