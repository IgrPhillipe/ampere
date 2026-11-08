import { SectionHeading } from "@components/SectionHeading";
import { Button } from "@components/ui/button";
import { Skeleton } from "@components/ui/skeleton";
import { padCount } from "@features/shared";
import { cn } from "@lib/utils";
import type { Finding } from "@services/project-review";
import type { ProjectDetail } from "@services/projects";
import { ArrowRight } from "lucide-react";
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
	// A section links here with the finding in the hash, to answer it at once.
	const [openedId, setOpenedId] = useState<string | null>(
		() => window.location.hash.match(/^#apontamento-(\d+)$/)?.[1] ?? null,
	);
	const opened = findings?.find((finding) => finding.id === openedId);
	const referenceOf = (finding: Finding) =>
		describeFindingReference(finding, referenceOptions);

	const respondFrom = (
		finding: Finding,
		status: FindingResponseValues["status"],
	) => {
		setOpenedId(finding.id);
		onStartResponse(finding, status);
	};

	const renderCard = (finding: Finding, position: number) => (
		<FindingRow
			key={finding.id}
			finding={finding}
			reference={referenceOf(finding)}
			index={position + 1}
			onOpen={() => setOpenedId(finding.id)}
			actions={
				onOpenStage || canRespond ? (
					<>
						{onOpenStage ? (
							<Button
								type="button"
								variant="link"
								className="h-auto px-0"
								onClick={() => onOpenStage(finding)}
							>
								Abrir Seção
								<ArrowRight aria-hidden="true" />
							</Button>
						) : null}
						{canRespond ? (
							<>
								<Button
									type="button"
									variant="link"
									className="h-auto px-0"
									onClick={() => respondFrom(finding, "FIXED")}
								>
									Marcar Corrigido
								</Button>
								<Button
									type="button"
									variant="link"
									className="h-auto px-0"
									onClick={() => respondFrom(finding, "CONTESTED")}
								>
									Contestar
								</Button>
							</>
						) : null}
					</>
				) : undefined
			}
		/>
	);

	const closeDialog = () => {
		setOpenedId(null);
		onCancelResponse();
	};

	return (
		<div className={cn("flex flex-col gap-9.5 px-6 py-8 md:px-10", className)}>
			{summary ? (
				<div className="flex flex-col border border-border bg-background">
					{summary}
				</div>
			) : null}

			<section aria-labelledby="findings-title">
				<SectionHeading
					id="findings-title"
					meta={`${padCount(current.length)} ${current.length === 1 ? "aguarda resposta" : "aguardam resposta"}`}
				>
					Apontamentos
				</SectionHeading>

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

			<FindingDialog
				finding={opened}
				referenceOf={referenceOf}
				onClose={closeDialog}
			>
				{(finding) => (
					<ProjectFindingCard
						finding={finding}
						reference={referenceOf(finding)}
						canRespond={canRespond && awaiting(finding)}
						responseStatus={
							responseEditor?.findingId === finding.id
								? responseEditor.status
								: undefined
						}
						isResponding={isResponding}
						onOpenStage={
							onOpenStage
								? (target) => {
										setOpenedId(null);
										onOpenStage(target);
									}
								: undefined
						}
						onStartResponse={onStartResponse}
						onSubmitResponse={onSubmitResponse}
						onCancelResponse={onCancelResponse}
					/>
				)}
			</FindingDialog>
		</div>
	);
};
