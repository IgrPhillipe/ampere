import { Button } from "@components/ui/button";
import { ProjectDetailFooter } from "@features/projects";
import { padCount } from "@features/shared";
import type { ReviewDecision } from "@services/project-review";
import type { ReactNode } from "react";

import type { DecisionAvailability } from "./review-decision";

interface DecisionFooterProps {
	availability: DecisionAvailability;
	/** Whether the profile decides this review now. */
	canDecide: boolean;
	closedMessage?: string;
	/** Actions beyond the decision, such as editing or deleting the project. */
	children?: ReactNode;
	onBack: () => void;
	onDecide: (decision: ReviewDecision) => void;
	className?: string;
}

export const DecisionFooter = ({
	availability,
	canDecide,
	closedMessage,
	children,
	onBack,
	onDecide,
	className,
}: DecisionFooterProps) => {
	const {
		pendingCount,
		blockingCount,
		approveBlockedReason,
		rejectBlockedReason,
	} = availability;
	const reasons = [approveBlockedReason, rejectBlockedReason].filter(
		(reason): reason is string => reason !== null,
	);

	return (
		<ProjectDetailFooter
			backLabel="Voltar para a Fila de Análise"
			onBack={onBack}
			summary={
				<p className="font-mono text-xs tracking-[0.08em] whitespace-nowrap text-muted-foreground uppercase">
					{padCount(pendingCount)}{" "}
					{pendingCount === 1 ? "pendência" : "pendências"},{" "}
					{padCount(blockingCount)}{" "}
					{blockingCount === 1 ? "bloqueante" : "bloqueantes"}
				</p>
			}
			className={className}
		>
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
									rejectBlockedReason ? "decisao-motivo" : undefined
								}
								onClick={() => onDecide("REJECT")}
							>
								Reprovar com Apontamentos
							</Button>

							<Button
								type="button"
								disabled={approveBlockedReason !== null}
								aria-describedby={
									approveBlockedReason ? "decisao-motivo" : undefined
								}
								onClick={() => onDecide("APPROVE")}
							>
								Aprovar Projeto
							</Button>
						</div>

						{reasons.length > 0 ? (
							<p
								id="decisao-motivo"
								className="text-xs text-muted-foreground md:text-right"
							>
								{reasons.join(" ")}
							</p>
						) : null}
					</div>
				) : null}

				{children}
			</div>
		</ProjectDetailFooter>
	);
};
