import { Skeleton } from "@components/ui/skeleton";
import { findingStageLabels } from "@features/projects";
import { padCount } from "@features/shared";
import type { ReviewFindingRankingItem } from "@services/dashboard";
import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";

import { DashboardSection, DashboardSectionEmpty } from "../DashboardSection";

interface ReviewFindingsRankingProps {
	items?: ReviewFindingRankingItem[];
	className?: string;
}

const keyOf = ({ stage, standardItem }: ReviewFindingRankingItem) =>
	`${stage}-${standardItem ?? ""}`;

const describeItem = ({ stage, standardItem }: ReviewFindingRankingItem) =>
	standardItem
		? `${findingStageLabels[stage]}: ${standardItem}`
		: findingStageLabels[stage];

const RankingLine = ({
	item,
	max,
}: {
	item: ReviewFindingRankingItem;
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
							className={`size-3.5 shrink-0 transition-transform ${isOpen ? "" : "-rotate-90"}`}
						/>
						{describeItem(item)}
					</span>
					<span className="font-mono text-sm font-semibold">
						{padCount(item.total)}
					</span>
				</span>
				<span aria-hidden="true" className="block h-1 w-full max-w-md bg-muted">
					<span
						className="block h-full bg-primary"
						style={{ width: `${(item.total / max) * 100}%` }}
					/>
				</span>
			</button>

			<ul
				id={listId}
				hidden={!isOpen}
				aria-label={`Projetos com o apontamento ${describeItem(item)}`}
				className="flex flex-col gap-2 pb-5 pl-5.5"
			>
				{item.projects.length === 0 ? (
					<li className="text-sm text-muted-foreground">
						Nenhum projeto para listar.
					</li>
				) : (
					item.projects.map((project) => (
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

/** H12: the findings the team issued most, each line opening the projects that got it. */
export const ReviewFindingsRanking = ({
	items,
	className,
}: ReviewFindingsRankingProps) => {
	const max = Math.max(1, ...(items ?? []).map(({ total }) => total));

	return (
		<DashboardSection
			title="Apontamentos Mais Frequentes"
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
					Nenhum apontamento emitido no período.
				</DashboardSectionEmpty>
			) : (
				<ol className="flex flex-col">
					{items.map((item) => (
						<RankingLine key={keyOf(item)} item={item} max={max} />
					))}
				</ol>
			)}
		</DashboardSection>
	);
};
