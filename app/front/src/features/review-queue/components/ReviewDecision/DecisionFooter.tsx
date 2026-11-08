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
	const { decisions, blockedReason, approvalBlockedReason } = availability;
	const both = decisions.length > 1;

	return (
		<ProjectDetailFooter className={className}>
			<div className="flex w-full flex-col gap-3 md:w-auto md:items-end">
				{closedMessage ? (
					<p className="text-sm text-muted-foreground">{closedMessage}</p>
				) : canDecide ? (
					decisions.length > 0 ? (
						<div className="flex flex-col-reverse gap-2 md:flex-row md:items-center">
							{approvalBlockedReason ? (
								<p className="text-sm text-muted-foreground md:mr-2 md:text-right">
									{approvalBlockedReason}
								</p>
							) : null}
							{decisions.includes("REJECT") ? (
								<Button
									type="button"
									variant={both ? "outline" : "default"}
									onClick={() => onDecide("REJECT")}
								>
									Reprovar com Apontamentos
								</Button>
							) : null}
							{decisions.includes("APPROVE") ? (
								<Button type="button" onClick={() => onDecide("APPROVE")}>
									Aprovar Projeto
								</Button>
							) : null}
						</div>
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
