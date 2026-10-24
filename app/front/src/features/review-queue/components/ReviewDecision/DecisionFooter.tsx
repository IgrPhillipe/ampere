import { Button } from "@components/ui/button";
import { ProjectDetailFooter } from "@features/projects";
import type { ReviewDecision } from "@services/project-review";

import type { DecisionAvailability } from "./review-decision";

interface DecisionFooterProps {
	availability: DecisionAvailability;
	/** Whether the profile decides this review now. */
	canDecide: boolean;
	closedMessage?: string;
	onDecide: (decision: ReviewDecision) => void;
	className?: string;
}

export const DecisionFooter = ({
	availability,
	canDecide,
	closedMessage,
	onDecide,
	className,
}: DecisionFooterProps) => {
	const { decision, blockedReason } = availability;

	return (
		<ProjectDetailFooter className={className}>
			<div className="flex w-full flex-col gap-3 md:w-auto md:items-end">
				{closedMessage ? (
					<p className="text-sm text-muted-foreground">{closedMessage}</p>
				) : canDecide ? (
					decision === "REJECT" ? (
						<Button type="button" onClick={() => onDecide("REJECT")}>
							Reprovar com Apontamentos
						</Button>
					) : decision === "APPROVE" ? (
						<Button type="button" onClick={() => onDecide("APPROVE")}>
							Aprovar Projeto
						</Button>
					) : (
						<p className="text-sm text-muted-foreground md:text-right">
							{blockedReason}
						</p>
					)
				) : null}
			</div>
		</ProjectDetailFooter>
	);
};
