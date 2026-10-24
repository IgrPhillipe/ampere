import { Skeleton } from "@components/ui/skeleton";
import { padCount } from "@features/shared";
import { cn } from "@lib/utils";
import type { Finding } from "@services/project-review";
import type { ProjectDetail } from "@services/projects";
import { type ReactNode, useState } from "react";

import {
	awaitsDesignerResponse,
	describeFindingReference,
	type FindingReferenceOptions,
} from "../../constants";
import type { FindingResponseValues } from "../../schemas";
import { FindingDialog, FindingRow } from "../FindingDetails";
import { ProjectFindingCard } from "./ProjectFindingCard";

const severityOrder = { BLOCKING: 0, ADJUSTMENT: 1 } as const;

const byPriority = (left: Finding, right: Finding) =>
	severityOrder[left.severity] - severityOrder[right.severity] ||
	right.version - left.version ||
	left.id.localeCompare(right.id, "pt-BR", { numeric: true });

interface ProjectFindingsOverviewProps {
	/** `undefined` while loading. */
	findings?: Finding[];
	project: Pick<ProjectDetail, "status">;
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
	onOpenStage?: (finding: Finding) => void;
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
	// A step links here with the finding in the hash, to answer it at once.
	const [openedId, setOpenedId] = useState<string | null>(
		() => window.location.hash.match(/^#apontamento-(\d+)$/)?.[1] ?? null,
	);
	const opened = findings?.find((finding) => finding.id === openedId);
	const referenceOf = (finding: Finding) =>
		describeFindingReference(finding, referenceOptions);

	const renderCard = (finding: Finding) => (
		<FindingRow
			key={finding.id}
			finding={finding}
			reference={referenceOf(finding)}
			onOpen={() => setOpenedId(finding.id)}
		/>
	);

	const closeDialog = () => {
		setOpenedId(null);
		onCancelResponse();
	};

	return (
		<div className={cn("flex flex-col gap-8 px-6 py-8 md:px-8", className)}>
			{summary ? (
				<div className="flex flex-col border border-border bg-background">
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

			<FindingDialog
				finding={opened}
				reference={opened ? referenceOf(opened) : null}
				onClose={closeDialog}
			>
				{opened ? (
					<ProjectFindingCard
						finding={opened}
						reference={referenceOf(opened)}
						canRespond={canRespond && awaiting(opened)}
						responseStatus={
							responseEditor?.findingId === opened.id
								? responseEditor.status
								: undefined
						}
						isResponding={isResponding}
						onOpenStage={
							onOpenStage
								? (finding) => {
										setOpenedId(null);
										onOpenStage(finding);
									}
								: undefined
						}
						onStartResponse={onStartResponse}
						onSubmitResponse={onSubmitResponse}
						onCancelResponse={onCancelResponse}
					/>
				) : null}
			</FindingDialog>
		</div>
	);
};
