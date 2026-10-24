import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import {
	describeFindingReference,
	type FindingReferenceOptions,
	findingSeverityBadgeVariants,
	findingSeverityLabels,
	findingStageLabels,
	findingStatusBadgeVariants,
	findingStatusLabels,
} from "@features/projects";
import { formatDate } from "@features/shared";
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
	const answer = finding.response || designerAnswers[finding.status];

	return (
		<li
			className={cn(
				"flex flex-col gap-3 border-b border-border py-4 last:border-b-0",
				isSelected && "-mx-3 rounded-xs bg-surface-hover px-3",
			)}
		>
			<div className="flex flex-wrap items-center gap-2">
				<Badge variant={findingSeverityBadgeVariants[finding.severity]}>
					{findingSeverityLabels[finding.severity]}
				</Badge>
				<Badge variant={findingStatusBadgeVariants[finding.status]}>
					{findingStatusLabels[finding.status]}
				</Badge>
			</div>

			<div className="flex flex-col gap-1">
				<p className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
					{findingStageLabels[finding.stage]}
					{reference ? `: ${reference}` : null}
				</p>
				<p className="text-sm whitespace-pre-line text-foreground">
					{finding.description}
				</p>
				{finding.standardItem ? (
					<p className="font-mono text-xs text-muted-foreground">
						{finding.standardItem}
					</p>
				) : null}
			</div>

			<p className="text-xs text-muted-foreground">
				{finding.authorName ?? "Analista não informado"}, em{" "}
				<time dateTime={finding.createdAt}>
					{formatDate(finding.createdAt)}
				</time>
				{isDraft ? null : `, ${finding.version}º envio`}
			</p>

			{answer ? (
				<blockquote className="border-l-2 border-border pl-3">
					<p className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
						Resposta do projetista
					</p>
					<p className="mt-1 text-sm text-foreground">{answer}</p>
					{finding.respondedAt ? (
						<p className="mt-1 text-xs text-muted-foreground">
							Respondido em{" "}
							<time dateTime={finding.respondedAt}>
								{formatDate(finding.respondedAt)}
							</time>
						</p>
					) : null}
				</blockquote>
			) : null}

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
