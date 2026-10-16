import { Button } from "@components/ui/button";
import { padCount } from "@features/shared";
import { cn } from "@lib/utils";
import type { ReviewDecision } from "@services/project-review";
import { ArrowLeft } from "lucide-react";

import type { DecisionAvailability } from "./review-decision";

interface DecisionFooterProps {
	availability: DecisionAvailability;
	editable: boolean;
	closedMessage?: string;
	onBack: () => void;
	onDecide: (decision: ReviewDecision) => void;
	className?: string;
}

export const DecisionFooter = ({
	availability,
	editable,
	closedMessage,
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
		<div
			className={cn(
				"flex flex-col gap-3 border-t border-border px-6 py-4 md:flex-row md:items-center md:justify-between md:gap-6 md:px-8",
				className,
			)}
		>
			<div className="flex shrink-0 items-center gap-4">
				<Button
					type="button"
					variant="outline"
					size="icon"
					aria-label="Voltar para a Fila de Análise"
					onClick={onBack}
				>
					<ArrowLeft aria-hidden="true" />
				</Button>

				<p className="font-mono text-xs tracking-[0.08em] whitespace-nowrap text-muted-foreground uppercase">
					{padCount(pendingCount)}{" "}
					{pendingCount === 1 ? "pendência" : "pendências"},{" "}
					{padCount(blockingCount)}{" "}
					{blockingCount === 1 ? "bloqueante" : "bloqueantes"}
				</p>
			</div>

			{closedMessage ? (
				<p className="text-sm text-muted-foreground">{closedMessage}</p>
			) : editable ? (
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
		</div>
	);
};
