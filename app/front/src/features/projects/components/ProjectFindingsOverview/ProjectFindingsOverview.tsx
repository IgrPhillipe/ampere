import type { Finding } from "@services/project-review";

import { ProjectFindingCard } from "./ProjectFindingCard";

const severityOrder = { BLOCKING: 0, ADJUSTMENT: 1 } as const;

interface ProjectFindingsOverviewProps {
	findings: Finding[];
	reviewOpinion?: string | null;
	onOpenStage: (finding: Finding) => void;
}

export const ProjectFindingsOverview = ({
	findings,
	reviewOpinion,
	onOpenStage,
}: ProjectFindingsOverviewProps) => {
	const orderedFindings = [...findings].sort(
		(left, right) =>
			severityOrder[left.severity] - severityOrder[right.severity] ||
			left.id.localeCompare(right.id, "pt-BR", { numeric: true }),
	);

	return (
		<div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
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
						{String(findings.length).padStart(2, "0")}
					</span>
				</div>

				<ul>
					{orderedFindings.map((finding) => (
						<ProjectFindingCard
							key={finding.id}
							finding={finding}
							onOpenStage={onOpenStage}
						/>
					))}
				</ul>
			</section>

			<aside className="h-fit border border-border bg-surface-hover p-5">
				<p className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
					Parecer da reprovação
				</p>
				<p className="mt-4 text-sm whitespace-pre-line text-foreground">
					{reviewOpinion || "O analista não registrou um parecer geral."}
				</p>
			</aside>
		</div>
	);
};
