import { Skeleton } from "@components/ui/skeleton";
import { cn } from "@lib/utils";
import type { UnderReviewItem } from "@services/dashboard";
import { Link } from "@tanstack/react-router";

import { DashboardSection, DashboardSectionEmpty } from "../DashboardSection";

const days = (count: number) => (count === 1 ? "1 dia" : `${count} dias`);

const describeDeadline = (daysRemaining: number) => {
	if (daysRemaining < 0) return `Atrasado há ${days(-daysRemaining)}`;
	if (daysRemaining === 0) return "Vence hoje";

	return daysRemaining === 1
		? "1 dia restante"
		: `${daysRemaining} dias restantes`;
};

interface UnderReviewListProps {
	items?: UnderReviewItem[];
	className?: string;
}

export const UnderReviewList = ({ items, className }: UnderReviewListProps) => (
	<DashboardSection title="Em Análise" className={className}>
		{!items ? (
			<div className="flex flex-col gap-3 py-4">
				<Skeleton className="h-6 w-full" />
				<Skeleton className="h-6 w-full" />
			</div>
		) : items.length === 0 ? (
			<DashboardSectionEmpty>Nenhum projeto em análise.</DashboardSectionEmpty>
		) : (
			<ul className="flex flex-col">
				{items.map(({ id, name, protocol, daysRemaining }) => (
					<li
						key={id}
						className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border py-3 last:border-b-0"
					>
						<Link
							to="/projetos/$id"
							params={{ id }}
							className="text-sm hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
						>
							{name}
							{protocol ? (
								<span className="text-muted-foreground">, {protocol}</span>
							) : null}
						</Link>
						<span
							className={cn(
								"font-mono text-xs tracking-wider uppercase",
								daysRemaining < 0
									? "text-destructive"
									: daysRemaining === 0
										? "text-warning-foreground"
										: "text-muted-foreground",
							)}
						>
							{describeDeadline(daysRemaining)}
						</span>
					</li>
				))}
			</ul>
		)}
	</DashboardSection>
);
