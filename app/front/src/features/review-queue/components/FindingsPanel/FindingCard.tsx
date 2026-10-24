import { Button } from "@components/ui/button";
import {
	describeFindingReference,
	FindingAnswer,
	type FindingReferenceOptions,
	FindingSummary,
} from "@features/projects";
import { cn } from "@lib/utils";
import type {
	Finding,
	FindingResolution,
	FindingStatus,
} from "@services/project-review";

import { isDraftFinding } from "../ReviewDecision/review-decision";

const designerAnswers = {
	DRAFT: null,
	OPEN: "Sem resposta do projetista.",
	FIXED: "O projetista marcou o apontamento como corrigido.",
	CONTESTED: "O projetista contestou o apontamento.",
	RESOLVED: null,
} as const satisfies Record<FindingStatus, string | null>;

export interface FindingCardActions {
	onEdit: (finding: Finding) => void;
	onDelete: (finding: Finding) => void;
	onResolve: (finding: Finding, resolution: FindingResolution) => void;
}

interface FindingCardProps extends FindingCardActions {
	finding: Finding;
	referenceOptions: FindingReferenceOptions;
	editable: boolean;
	pendingId?: string;
	isSelected?: boolean;
}

export const FindingCard = ({
	finding,
	referenceOptions,
	editable,
	pendingId,
	isSelected = false,
	onEdit,
	onDelete,
	onResolve,
}: FindingCardProps) => {
	const reference = describeFindingReference(finding, referenceOptions);
	const isDraft = isDraftFinding(finding);
	const isPending = pendingId === finding.id;
	return (
		<li
			className={cn(
				"flex flex-col gap-4 border-b border-border py-5 last:border-b-0",
				isSelected && "-mx-3 rounded-xs bg-surface-hover px-3",
			)}
		>
			<FindingSummary
				finding={finding}
				reference={reference}
				showVersion={!isDraft}
			/>

			<FindingAnswer
				title="Resposta do Projetista"
				text={finding.response}
				fallback={designerAnswers[finding.status] ?? undefined}
				respondedAt={finding.respondedAt}
			/>

			{editable ? (
				<div className="flex flex-wrap justify-end gap-2">
					{isDraft ? (
						<>
							<Button
								type="button"
								size="xs"
								variant="destructive-ghost"
								disabled={isPending}
								onClick={() => onDelete(finding)}
							>
								Excluir
							</Button>
							<Button
								type="button"
								size="xs"
								variant="outline"
								disabled={isPending}
								onClick={() => onEdit(finding)}
							>
								Editar
							</Button>
						</>
					) : (
						<>
							{finding.status === "OPEN" ? null : (
								<Button
									type="button"
									size="xs"
									variant="outline"
									disabled={isPending}
									onClick={() => onResolve(finding, "REOPEN")}
								>
									Reabrir
								</Button>
							)}
							{finding.status === "RESOLVED" ? null : (
								<Button
									type="button"
									size="xs"
									disabled={isPending}
									onClick={() => onResolve(finding, "ACCEPT")}
								>
									Aceitar Correção
								</Button>
							)}
						</>
					)}
				</div>
			) : null}
		</li>
	);
};
