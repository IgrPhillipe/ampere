import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";
import { type Finding, useRespondFinding } from "@services/project-review";
import { useGetProject } from "@services/projects";
import type { ProjectDocument } from "@services/submission";
import { Eye, MessageSquareWarning } from "lucide-react";
import { useState } from "react";

import { findingTarget } from "../../constants";
import { useProjectDetailActions } from "../../hooks";
import type { FindingResponseValues } from "../../schemas";
import { FindingAnswer, FindingSummary } from "../FindingDetails";
import { DocumentDialog } from "../ProjectDocuments";
import { FindingResponseForm } from "../ProjectFindingsOverview/FindingResponseForm";

interface StageFindingsNoticeProps {
	projectId: string;
	/** Findings of this section still waiting on the designer. */
	findings: Finding[];
	/** Names of the items the findings point to, by id or code. */
	references?: Record<string, string>;
	/** Attached files, so a finding on a document opens it. */
	documents?: ProjectDocument[];
	className?: string;
}

const referenceOf = (
	finding: Finding,
	references: Record<string, string> = {},
) => {
	const key =
		finding.consumerUnitGroupId ??
		finding.calculationStepCode ??
		finding.documentType;

	return key ? (references[key] ?? key) : null;
};

const documentOf = (finding: Finding, documents: ProjectDocument[]) =>
	documents.find((document) => document.type === finding.documentType);

/**
 * What the analyst asked for in this section, read and answered where the designer fixes it.
 * Keep it out of the section's own form: the answer is a form too.
 */
export const StageFindingsNotice = ({
	projectId,
	findings,
	references,
	documents = [],
	className,
}: StageFindingsNoticeProps) => {
	const [viewing, setViewing] = useState<ProjectDocument>();
	const [responding, setResponding] = useState<{
		findingId: string;
		status: FindingResponseValues["status"];
	} | null>(null);
	const project = useGetProject(projectId).data?.data;
	const { respondFindings: canRespond } = useProjectDetailActions({
		status: project?.status,
		ownerId: project?.ownerId,
	});
	const respondMutation = useRespondFinding();

	if (findings.length === 0) return null;

	const respond = (finding: Finding, values: FindingResponseValues) =>
		respondMutation.mutate(
			{
				projectId,
				findingId: finding.id,
				status: values.status,
				response: values.response || undefined,
			},
			{ onSuccess: () => setResponding(null) },
		);

	const hash = typeof window === "undefined" ? "" : window.location.hash;

	return (
		<section
			aria-labelledby="apontamentos-etapa-titulo"
			className={cn(
				"mx-6 flex flex-col gap-4 rounded-xs border border-border border-l-4 border-l-brand-sunset bg-card px-5 py-4 md:mx-8",
				className,
			)}
		>
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h2
					id="apontamentos-etapa-titulo"
					className="flex items-center gap-2 text-base font-semibold text-foreground"
				>
					<MessageSquareWarning aria-hidden="true" className="size-4" />
					{findings.length === 1
						? "Apontamento Nesta Seção"
						: `${findings.length} Apontamentos Nesta Seção`}
				</h2>
			</div>

			<ul className="flex flex-col">
				{findings.map((finding) => {
					const target = findingTarget(finding);
					const status =
						responding?.findingId === finding.id
							? responding.status
							: undefined;

					return (
						<li
							key={finding.id}
							className={cn(
								"flex flex-col gap-3 border-t border-border py-4 first:border-t-0 first:pt-0 last:pb-0",
								target &&
									hash === `#${target}` &&
									"-mx-3 rounded-xs px-3 first:pt-3 last:pb-3 motion-safe:animate-highlight",
							)}
						>
							<FindingSummary
								finding={finding}
								reference={referenceOf(finding, references)}
								variant="inline"
							/>
							<FindingAnswer
								title="Resposta do Projetista"
								text={finding.response}
								fallback={
									finding.status === "FIXED"
										? "Marcado como corrigido sem observação."
										: undefined
								}
								respondedAt={finding.respondedAt}
							/>
							<div className="flex flex-wrap gap-2">
								{documentOf(finding, documents) ? (
									<Button
										type="button"
										variant="outline"
										size="xs"
										onClick={() => setViewing(documentOf(finding, documents))}
									>
										<Eye aria-hidden="true" />
										Ver Documento
									</Button>
								) : null}
								{canRespond ? (
									<>
										<Button
											type="button"
											variant="outline"
											size="xs"
											aria-expanded={status === "CONTESTED"}
											onClick={() =>
												setResponding({
													findingId: finding.id,
													status: "CONTESTED",
												})
											}
										>
											Contestar
										</Button>
										<Button
											type="button"
											size="xs"
											aria-expanded={status === "FIXED"}
											onClick={() =>
												setResponding({
													findingId: finding.id,
													status: "FIXED",
												})
											}
										>
											Corrigido
										</Button>
									</>
								) : null}
							</div>

							{canRespond && status ? (
								<FindingResponseForm
									key={status}
									status={status}
									initialResponse={finding.response}
									isPending={respondMutation.isPending}
									onSubmit={(values) => respond(finding, values)}
									onCancel={() => setResponding(null)}
								/>
							) : null}
						</li>
					);
				})}
			</ul>

			<DocumentDialog
				projectId={projectId}
				document={viewing}
				onClose={() => setViewing(undefined)}
			/>
		</section>
	);
};
