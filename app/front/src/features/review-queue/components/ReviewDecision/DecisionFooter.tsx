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
	const { approveBlockedReason, rejectBlockedReason } = availability;

	return (
		<ProjectDetailFooter className={className}>
			<div className="flex w-full flex-col gap-3 md:w-auto md:items-end">
				{closedMessage ? (
					<p className="text-sm text-muted-foreground">{closedMessage}</p>
				) : canDecide ? (
					<div className="flex flex-col gap-2 md:items-end">
						<div className="flex flex-col-reverse gap-2 sm:flex-row">
							<Button
								type="button"
								variant="outline"
								disabled={rejectBlockedReason !== null}
								aria-describedby={
									rejectBlockedReason ? "decisao-motivo-reprovar" : undefined
								}
								onClick={() => onDecide("REJECT")}
							>
								Reprovar com Apontamentos
							</Button>

							<Button
								type="button"
								disabled={approveBlockedReason !== null}
								aria-describedby={
									approveBlockedReason ? "decisao-motivo-aprovar" : undefined
								}
								onClick={() => onDecide("APPROVE")}
							>
								Aprovar Projeto
							</Button>
						</div>

						{approveBlockedReason ? (
							<p
								id="decisao-motivo-aprovar"
								className="text-xs text-muted-foreground md:text-right"
							>
								{approveBlockedReason}
							</p>
						) : null}
						{rejectBlockedReason ? (
							<p id="decisao-motivo-reprovar" className="sr-only">
								{rejectBlockedReason}
							</p>
						) : null}
					</div>
				) : null}
			</div>
		</ProjectDetailFooter>
	);
};
