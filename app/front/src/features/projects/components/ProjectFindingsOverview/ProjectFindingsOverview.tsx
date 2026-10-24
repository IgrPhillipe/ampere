import { Skeleton } from "@components/ui/skeleton";
import { padCount } from "@features/shared";
import { cn } from "@lib/utils";
import type { Finding } from "@services/project-review";
import type { ProjectDetail } from "@services/projects";
import type { ReactNode } from "react";

import {
	awaitsDesignerResponse,
	describeFindingReference,
	type FindingReferenceOptions,
} from "../../constants";
import type { FindingResponseValues } from "../../schemas";
import { ProjectFindingCard } from "./ProjectFindingCard";

const severityOrder = { BLOCKING: 0, ADJUSTMENT: 1 } as const;

const byPriority = (left: Finding, right: Finding) =>
	severityOrder[left.severity] - severityOrder[right.severity] ||
	right.version - left.version ||
	left.id.localeCompare(right.id, "pt-BR", { numeric: true });

const opinionTitles: Partial<Record<ProjectDetail["status"], string>> = {
	REJECTED: "Parecer da Reprovação",
	APPROVED: "Parecer da Aprovação",
};

interface ProjectFindingsOverviewProps {
	/** `undefined` while loading. */
	findings?: Finding[];
	project: Pick<ProjectDetail, "status" | "reviewOpinion">;
	referenceOptions: FindingReferenceOptions;
	/** Whether the profile answers findings; each one still has to await an answer. */
	canRespond: boolean;
	responseEditor?: {
		findingId: string;
		status: FindingResponseValues["status"];
	};
	isResponding: boolean;
	/** Shown above the findings: the resubmission form or the next steps. */
	summary?: ReactNode;
	onOpenStage: (finding: Finding) => void;
	onStartResponse: (
		finding: Finding,
		status: FindingResponseValues["status"],
	) => void;
	onSubmitResponse: (values: FindingResponseValues) => void;
	onCancelResponse: () => void;
	className?: string;
}

export const ProjectFindingsOverview = ({
	findings,
	project,
	referenceOptions,
	canRespond,
	responseEditor,
	isResponding,
	summary,
	onOpenStage,
	onStartResponse,
	onSubmitResponse,
	onCancelResponse,
	className,
}: ProjectFindingsOverviewProps) => {
	const awaiting = (finding: Finding) =>
		awaitsDesignerResponse(finding, project);
	const current = (findings ?? []).filter(awaiting).sort(byPriority);
	const history = (findings ?? [])
		.filter((finding) => !awaiting(finding))
		.sort(byPriority);
	const opinionTitle = opinionTitles[project.status];

	const renderCard = (finding: Finding) => (
		<ProjectFindingCard
			key={finding.id}
			finding={finding}
			reference={describeFindingReference(finding, referenceOptions)}
			canRespond={canRespond && awaiting(finding)}
			responseStatus={
				responseEditor?.findingId === finding.id
					? responseEditor.status
					: undefined
			}
			isResponding={isResponding}
			onOpenStage={onOpenStage}
			onStartResponse={onStartResponse}
			onSubmitResponse={onSubmitResponse}
			onCancelResponse={onCancelResponse}
		/>
	);

	return (
		<div className={cn("flex flex-col gap-8 px-6 py-8 md:px-8", className)}>
			{opinionTitle || summary ? (
				<div className="flex flex-col border border-border">
					{opinionTitle ? (
						<section aria-labelledby="review-opinion-title" className="p-5">
							<h2
								id="review-opinion-title"
								className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase"
							>
								{opinionTitle}
							</h2>
							<p className="mt-4 text-sm whitespace-pre-line text-foreground">
								{project.reviewOpinion ||
									"O analista não registrou um parecer geral."}
							</p>
						</section>
					) : null}
					{summary}
				</div>
			) : null}

			<section aria-labelledby="findings-title">
				<div className="flex items-end justify-between gap-4 border-b-2 border-foreground pb-3">
					<div>
						<p className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
							Correções solicitadas
						</p>
						<h2 id="findings-title" className="mt-1 text-lg font-semibold">
							Apontamentos
						</h2>
					</div>
					<span className="font-mono text-sm text-muted-foreground">
						{padCount(current.length)}
					</span>
				</div>

				{findings === undefined ? (
					<div aria-busy="true" className="flex flex-col gap-3 py-5">
						<Skeleton className="h-5 w-40" />
						<Skeleton className="h-16 w-full" />
					</div>
				) : current.length > 0 ? (
					<ul>{current.map(renderCard)}</ul>
				) : (
					<p className="py-5 text-sm text-muted-foreground">
						{findings.length === 0
							? "Nenhum apontamento publicado para este projeto."
							: "Nenhum apontamento aguarda resposta nesta versão."}
					</p>
				)}
			</section>

			{history.length > 0 ? (
				<section aria-labelledby="findings-history-title">
					<h2
						id="findings-history-title"
						className="border-b border-border pb-3 text-base font-semibold"
					>
						Histórico
					</h2>
					<ul>{history.map(renderCard)}</ul>
				</section>
			) : null}
		</div>
	);
};
