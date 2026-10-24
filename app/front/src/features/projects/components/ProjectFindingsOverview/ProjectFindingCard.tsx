import { Button } from "@components/ui/button";
import type { Finding } from "@services/project-review";
import { ArrowRight } from "lucide-react";

import { isReopened } from "../../constants";
import type { FindingResponseValues } from "../../schemas";
import { FindingAnswer, FindingSummary } from "../FindingDetails";
import { FindingResponseForm } from "./FindingResponseForm";

interface ProjectFindingCardProps {
	finding: Finding;
	reference: string | null;
	canRespond: boolean;
	responseStatus?: FindingResponseValues["status"];
	isResponding: boolean;
	/** Left out when the project cannot be edited: its sections only show it. */
	onOpenStage?: (finding: Finding) => void;
	onStartResponse: (
		finding: Finding,
		status: FindingResponseValues["status"],
	) => void;
	onSubmitResponse: (values: FindingResponseValues) => void;
	onCancelResponse: () => void;
}

export const ProjectFindingCard = ({
	finding,
	reference,
	canRespond,
	responseStatus,
	isResponding,
	onOpenStage,
	onStartResponse,
	onSubmitResponse,
	onCancelResponse,
}: ProjectFindingCardProps) => {
	const descriptionId = `finding-${finding.id}-description`;
	const formId = `finding-${finding.id}-response`;

	return (
		<div className="flex flex-col gap-4">
			<FindingSummary
				finding={finding}
				reference={reference}
				descriptionId={descriptionId}
			/>

			<FindingAnswer
				title={
					isReopened(finding)
						? "Resposta Anterior do Projetista"
						: "Resposta do Projetista"
				}
				text={finding.response}
				fallback={
					finding.status === "FIXED"
						? "Marcado como corrigido sem observação."
						: undefined
				}
				respondedAt={finding.respondedAt}
			/>

			{isReopened(finding) ? (
				<p className="text-sm text-muted-foreground">
					O analista reabriu o apontamento. Responda de novo.
				</p>
			) : null}
			<div className="flex flex-col gap-3">
				<div className="flex flex-wrap gap-2">
					{onOpenStage ? (
						<Button
							type="button"
							variant="outline"
							size="xs"
							aria-describedby={descriptionId}
							onClick={() => onOpenStage(finding)}
						>
							Ir para a Seção
							<ArrowRight aria-hidden="true" />
						</Button>
					) : null}
					{canRespond ? (
						<>
							<Button
								type="button"
								variant="outline"
								size="xs"
								aria-describedby={descriptionId}
								aria-expanded={responseStatus === "CONTESTED"}
								aria-controls={
									responseStatus === "CONTESTED" ? formId : undefined
								}
								onClick={() => onStartResponse(finding, "CONTESTED")}
							>
								Contestar
							</Button>
							<Button
								type="button"
								size="xs"
								aria-describedby={descriptionId}
								aria-expanded={responseStatus === "FIXED"}
								aria-controls={responseStatus === "FIXED" ? formId : undefined}
								onClick={() => onStartResponse(finding, "FIXED")}
							>
								Corrigido
							</Button>
						</>
					) : null}
				</div>
			</div>

			{canRespond && responseStatus ? (
				<FindingResponseForm
					id={formId}
					status={responseStatus}
					initialResponse={finding.response}
					isPending={isResponding}
					onSubmit={onSubmitResponse}
					onCancel={onCancelResponse}
				/>
			) : null}
		</div>
	);
};
