import { InlineActionButton } from "@components/InlineActionButton";
import { Button } from "@components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipMessageContent,
	TooltipTrigger,
} from "@components/ui/tooltip";
import { ArrowRight } from "lucide-react";

interface AnalyzeButtonProps {
	/** Overdue or due today: a filled button. Otherwise it can wait, so a link. */
	urgent: boolean;
	/** Width of the filled button; the link keeps its own width. */
	buttonClassName?: string;
}

const preventNavigation = (event: { preventDefault: () => void }) =>
	event.preventDefault();

export const AnalyzeButton = ({
	urgent,
	buttonClassName,
}: AnalyzeButtonProps) => (
	<Tooltip>
		<TooltipTrigger
			render={
				urgent ? (
					<Button
						type="button"
						size="xs"
						aria-disabled="true"
						onClick={preventNavigation}
						className={buttonClassName}
					/>
				) : (
					<InlineActionButton
						aria-disabled="true"
						onClick={preventNavigation}
					/>
				)
			}
		>
			Analisar
			{urgent ? <ArrowRight aria-hidden="true" /> : null}
		</TooltipTrigger>
		<TooltipContent>
			<TooltipMessageContent
				title="Análise indisponível"
				action="A tela de conferência e apontamentos chega na próxima etapa."
			/>
		</TooltipContent>
	</Tooltip>
);
