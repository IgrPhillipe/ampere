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
	if (!closedMessage && !canDecide) return null;

	const reason = closedMessage ? null : blockedReason;

	return (
		<ProjectDetailFooter
			className={className}
			summary={
				closedMessage ? (
					<p className="text-sm text-muted-foreground">{closedMessage}</p>
				) : reason ? (
					<p className="flex items-center gap-2 text-sm text-foreground">
						<span
							aria-hidden="true"
							className="size-1.5 shrink-0 rounded-full bg-attention"
						/>
						{reason}
					</p>
				) : null
			}
		>
			{closedMessage ? null : (
				<div className="flex flex-col-reverse gap-3 sm:flex-row">
					<Button
						type="button"
						variant="outline"
						disabled={decision !== "REJECT"}
						onClick={() => onDecide("REJECT")}
					>
						Reprovar com Apontamentos
					</Button>
					<Button
						type="button"
						disabled={decision !== "APPROVE"}
						onClick={() => onDecide("APPROVE")}
					>
						Aprovar Projeto
					</Button>
				</div>
			)}
		</ProjectDetailFooter>
	);
};
