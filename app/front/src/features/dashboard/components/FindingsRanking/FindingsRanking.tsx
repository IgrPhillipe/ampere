import { Skeleton } from "@components/ui/skeleton";
import { findingStageLabels } from "@features/projects";
import { padCount } from "@features/shared";
import type { FindingRankingItem } from "@services/dashboard";

import { DashboardSection, DashboardSectionEmpty } from "../DashboardSection";

interface FindingsRankingProps {
	items?: FindingRankingItem[];
	className?: string;
}

const describeItem = ({ stage, standardItem }: FindingRankingItem) =>
	standardItem
		? `${findingStageLabels[stage]}: ${standardItem}`
		: findingStageLabels[stage];

export const FindingsRanking = ({ items, className }: FindingsRankingProps) => {
	const max = Math.max(1, ...(items ?? []).map(({ total }) => total));

	return (
		<DashboardSection
			title="Apontamentos Mais Recebidos"
			caption="Por etapa e item da norma"
			className={className}
		>
			{!items ? (
				<div className="flex flex-col gap-4 py-4">
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-full" />
				</div>
			) : items.length === 0 ? (
				<DashboardSectionEmpty>
					Nenhum apontamento recebido no período.
				</DashboardSectionEmpty>
			) : (
				<ol className="flex flex-col">
					{items.map((item) => (
						<li
							key={`${item.stage}-${item.standardItem}`}
							className="flex flex-col gap-3 border-b border-border py-5 last:border-b-0"
						>
							<div className="flex items-baseline justify-between gap-4">
								<span className="text-sm text-muted-foreground">
									{describeItem(item)}
								</span>
								<span className="font-mono text-sm font-semibold">
									{padCount(item.total)}
								</span>
							</div>
							<div aria-hidden="true" className="h-1 w-full max-w-md bg-muted">
								<div
									className="h-full bg-primary"
									style={{ width: `${(item.total / max) * 100}%` }}
								/>
							</div>
						</li>
					))}
				</ol>
			)}
		</DashboardSection>
	);
};
