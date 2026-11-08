import { Button } from "@components/ui/button";
import {
	describeFindingReference,
	FindingAnswer,
	type FindingReferenceOptions,
	FindingSummary,
} from "@features/projects";
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
}

export const FindingCard = ({
	finding,
	referenceOptions,
	editable,
	pendingId,
	onEdit,
	onDelete,
	onResolve,
}: FindingCardProps) => {
	const reference = describeFindingReference(finding, referenceOptions);
	const isDraft = isDraftFinding(finding);
	const isPending = pendingId === finding.id;
	return (
		<div className="flex flex-col gap-4">
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
				<div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2">
					{isDraft ? (
						<>
							<Button
								type="button"
								variant="destructive-ghost"
								className="h-auto px-0"
								disabled={isPending}
								onClick={() => onDelete(finding)}
							>
								Excluir
							</Button>
							<Button
								type="button"
								variant="link"
								className="h-auto px-0"
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
									variant="link"
									className="h-auto px-0"
									disabled={isPending}
									onClick={() => onResolve(finding, "REOPEN")}
								>
									Reabrir
								</Button>
							)}
							{finding.status === "RESOLVED" ? null : (
								<Button
									type="button"
									size="sm"
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
		</div>
	);
};
