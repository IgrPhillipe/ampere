import { padCount } from "@features/shared";
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

interface ProjectFindingsOverviewProps {
	findings: Finding[];
	project: Pick<ProjectDetail, "status" | "reviewOpinion">;
	referenceOptions: FindingReferenceOptions;
	responseEditor?: {
		findingId: string;
		status: FindingResponseValues["status"];
	};
	isResponding: boolean;
	resubmission?: ReactNode;
	onOpenStage: (finding: Finding) => void;
	onStartResponse: (
		finding: Finding,
		status: FindingResponseValues["status"],
	) => void;
	onSubmitResponse: (values: FindingResponseValues) => void;
	onCancelResponse: () => void;
}

export const ProjectFindingsOverview = ({
	findings,
	project,
	referenceOptions,
	responseEditor,
	isResponding,
	resubmission,
	onOpenStage,
	onStartResponse,
	onSubmitResponse,
	onCancelResponse,
}: ProjectFindingsOverviewProps) => {
	const current = findings
		.filter((finding) => awaitsDesignerResponse(finding, project))
		.sort(byPriority);
	const history = findings
		.filter((finding) => !awaitsDesignerResponse(finding, project))
		.sort(byPriority);

	const renderCard = (finding: Finding) => (
		<ProjectFindingCard
			key={finding.id}
			finding={finding}
			reference={describeFindingReference(finding, referenceOptions)}
			canRespond={awaitsDesignerResponse(finding, project)}
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
		<div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
			<div className="flex flex-col gap-10">
				<section aria-labelledby="findings-title">
					<div className="flex items-end justify-between gap-4 border-b border-foreground pb-3">
						<div>
							<p className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
								Correções solicitadas
							</p>
							<h2 id="findings-title" className="mt-1 text-xl font-semibold">
								Apontamentos
							</h2>
						</div>
						<span className="font-mono text-sm text-muted-foreground">
							{padCount(current.length)}
						</span>
					</div>

					{current.length > 0 ? (
						<ul>{current.map(renderCard)}</ul>
					) : (
						<p className="py-5 text-sm text-muted-foreground">
							Nenhum apontamento aguarda resposta nesta versão.
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

			<aside
				aria-labelledby="review-opinion-title"
				className="flex h-fit flex-col border border-border bg-background"
			>
				<div className="p-5">
					<h2
						id="review-opinion-title"
						className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase"
					>
						Parecer da Reprovação
					</h2>
					<p className="mt-4 text-sm whitespace-pre-line text-foreground">
						{project.reviewOpinion ||
							"O analista não registrou um parecer geral."}
					</p>
				</div>
				{resubmission}
			</aside>
		</div>
	);
};
