import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { formatDate } from "@features/shared";
import type { Finding } from "@services/project-review";
import { ArrowRight } from "lucide-react";

import {
	findingSeverityBadgeVariants,
	findingSeverityLabels,
	findingStageLabels,
	findingStatusBadgeVariants,
	findingStatusLabels,
} from "../../constants";
import type { FindingResponseValues } from "../../schemas";
import { FindingResponseForm } from "./FindingResponseForm";

interface ProjectFindingCardProps {
	finding: Finding;
	reference: string | null;
	canRespond: boolean;
	responseStatus?: FindingResponseValues["status"];
	isResponding: boolean;
	onOpenStage: (finding: Finding) => void;
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
		<li className="flex flex-col gap-4 border-b border-border py-5 last:border-b-0">
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
				<p
					id={descriptionId}
					className="text-sm whitespace-pre-line text-foreground"
				>
					{finding.description}
				</p>
				{finding.standardItem ? (
					<p className="font-mono text-xs text-muted-foreground">
						{finding.standardItem}
					</p>
				) : null}
			</div>

			{finding.response || finding.status === "FIXED" ? (
				<blockquote className="border-l-2 border-border pl-3">
					<p className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
						Resposta registrada
					</p>
					<p className="mt-1 text-sm whitespace-pre-line text-foreground">
						{finding.response || "Marcado como corrigido sem observação."}
					</p>
				</blockquote>
			) : null}

			<div className="flex flex-col gap-3">
				<p className="text-xs text-muted-foreground">
					{finding.authorName ?? "Analista não informado"}, em{" "}
					<time dateTime={finding.createdAt}>
						{formatDate(finding.createdAt)}
					</time>
					{`, ${finding.version}º envio`}
				</p>

				<div className="flex flex-wrap gap-2">
					<Button
						type="button"
						variant="outline"
						size="xs"
						aria-describedby={descriptionId}
						onClick={() => onOpenStage(finding)}
					>
						Ir para a Etapa
						<ArrowRight aria-hidden="true" />
					</Button>
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
		</li>
	);
};
