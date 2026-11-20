import { Skeleton } from "@components/ui/skeleton";
import { findingStageLabels } from "@features/projects";
import { padCount } from "@features/shared";
import { cn } from "@lib/utils";
import type {
	FindingRankingItem,
	ReviewDashboardProject,
} from "@services/dashboard";
import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";

import { DashboardSection, DashboardSectionEmpty } from "../DashboardSection";

/** With `projects`, the line opens the projects that got the finding. */
export type FindingsRankingItem = FindingRankingItem & {
	projects?: ReviewDashboardProject[];
};

interface FindingsRankingProps {
	items?: FindingsRankingItem[];
	title?: string;
	emptyMessage?: string;
	className?: string;
}

const describeItem = ({ stage, standardItem }: FindingRankingItem) =>
	standardItem
		? `${findingStageLabels[stage]}: ${standardItem}`
		: findingStageLabels[stage];

const RankingBar = ({ total, max }: { total: number; max: number }) => (
	<span aria-hidden="true" className="block h-1 w-full max-w-md bg-muted">
		<span
			className="block h-full bg-primary"
			style={{ width: `${(total / max) * 100}%` }}
		/>
	</span>
);

const StaticLine = ({
	item,
	max,
}: {
	item: FindingsRankingItem;
	max: number;
}) => (
	<li className="flex flex-col gap-3 border-b border-border py-5 last:border-b-0">
		<div className="flex items-baseline justify-between gap-4">
			<span className="text-sm text-muted-foreground">
				{describeItem(item)}
			</span>
			<span className="font-mono text-sm font-semibold">
				{padCount(item.total)}
			</span>
		</div>
		<RankingBar total={item.total} max={max} />
	</li>
);

const ExpandableLine = ({
	item,
	projects,
	max,
}: {
	item: FindingsRankingItem;
	projects: ReviewDashboardProject[];
	max: number;
}) => {
	const [isOpen, setOpen] = useState(false);
	const listId = useId();

	return (
		<li className="border-b border-border last:border-b-0">
			<button
				type="button"
				aria-expanded={isOpen}
				aria-controls={listId}
				onClick={() => setOpen((open) => !open)}
				className="flex w-full flex-col gap-3 py-5 text-left transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset"
			>
				<span className="flex w-full items-baseline justify-between gap-4">
					<span className="flex items-center gap-2 text-sm text-muted-foreground">
						<ChevronDown
							aria-hidden="true"
							className={cn(
								"size-3.5 shrink-0 transition-transform",
								!isOpen && "-rotate-90",
							)}
						/>
						{describeItem(item)}
					</span>
					<span className="font-mono text-sm font-semibold">
						{padCount(item.total)}
					</span>
				</span>
				<RankingBar total={item.total} max={max} />
			</button>

			<ul
				id={listId}
				hidden={!isOpen}
				aria-label={`Projetos com o apontamento ${describeItem(item)}`}
				className="flex flex-col gap-2 pb-5 pl-5.5"
			>
				{projects.length === 0 ? (
					<li className="text-sm text-muted-foreground">
						Nenhum projeto para listar.
					</li>
				) : (
					projects.map((project) => (
						<li key={project.id} className="flex items-baseline gap-3">
							<span className="w-24 shrink-0 font-mono text-xs text-muted-foreground">
								{project.protocol}
							</span>
							<Link
								to="/projetos/$id"
								params={{ id: project.id }}
								className="text-sm text-foreground hover:underline focus-visible:underline focus-visible:outline-none"
							>
								{project.name}
							</Link>
						</li>
					))
				)}
			</ul>
		</li>
	);
};

export const FindingsRanking = ({
	items,
	title = "Apontamentos Mais Recebidos",
	emptyMessage = "Nenhum apontamento recebido no período.",
	className,
}: FindingsRankingProps) => {
	const max = Math.max(1, ...(items ?? []).map(({ total }) => total));

	return (
		<DashboardSection
			title={title}
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
				<DashboardSectionEmpty>{emptyMessage}</DashboardSectionEmpty>
			) : (
				<ol className="flex flex-col">
					{items.map((item) =>
						item.projects ? (
							<ExpandableLine
								key={`${item.stage}-${item.standardItem}`}
								item={item}
								projects={item.projects}
								max={max}
							/>
						) : (
							<StaticLine
								key={`${item.stage}-${item.standardItem}`}
								item={item}
								max={max}
							/>
						),
					)}
				</ol>
			)}
		</DashboardSection>
	);
};
