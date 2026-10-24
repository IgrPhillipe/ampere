import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";
import type { Finding } from "@services/project-review";
import { Link } from "@tanstack/react-router";
import { ArrowRight, MessageSquareWarning } from "lucide-react";

import { findingTarget } from "../../constants";
import { FindingAnswer, FindingSummary } from "../FindingDetails";

interface StageFindingsNoticeProps {
	projectId: string;
	/** Findings of this step still waiting on the designer. */
	findings: Finding[];
	/** Names of the items the findings point to, by id or code. */
	references?: Record<string, string>;
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

/** What the analyst asked for in this step, read where the designer fixes it. */
export const StageFindingsNotice = ({
	projectId,
	findings,
	references,
	className,
}: StageFindingsNoticeProps) => {
	if (findings.length === 0) return null;

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
						? "Apontamento Nesta Etapa"
						: `${findings.length} Apontamentos Nesta Etapa`}
				</h2>
				<Button
					variant="outline"
					size="xs"
					render={<Link to="/projetos/$id" params={{ id: projectId }} />}
				>
					Responder no Projeto
					<ArrowRight aria-hidden="true" />
				</Button>
			</div>

			<ul className="flex flex-col">
				{findings.map((finding) => {
					const target = findingTarget(finding);

					return (
						<li
							key={finding.id}
							className={cn(
								"flex flex-col gap-3 border-t border-border py-4 first:border-t-0 first:pt-0 last:pb-0",
								target &&
									hash === `#${target}` &&
									"-mx-3 rounded-xs bg-accent px-3 first:pt-3 last:pb-3",
							)}
						>
							<FindingSummary
								finding={finding}
								reference={referenceOf(finding, references)}
							/>
							<FindingAnswer
								title="Resposta do Projetista"
								text={finding.response}
								respondedAt={finding.respondedAt}
							/>
						</li>
					);
				})}
			</ul>
		</section>
	);
};
