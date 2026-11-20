import { Skeleton } from "@components/ui/skeleton";
import dayjs from "@lib/dayjs";
import type { ReviewWeek } from "@services/dashboard";

import { DashboardSection, DashboardSectionEmpty } from "../DashboardSection";

interface WeeklyReviewChartProps {
	weeks?: ReviewWeek[];
	className?: string;
}

const weekLabel = (weekStart: string) => dayjs(weekStart).format("DD/MM");

const LEGEND = [
	{ label: "Recebidos", className: "bg-info" },
	{ label: "Decididos", className: "bg-primary" },
];

/** H12: grouped bars, received in blue and decided in green, without axis or grid. */
export const WeeklyReviewChart = ({
	weeks,
	className,
}: WeeklyReviewChartProps) => {
	const max = Math.max(
		1,
		...(weeks ?? []).flatMap(({ received, decided }) => [received, decided]),
	);
	const isEmpty =
		weeks?.every(({ received, decided }) => received + decided === 0) ?? false;

	return (
		<DashboardSection
			title="Recebidos e Decididos"
			caption="Por semana"
			className={className}
		>
			{!weeks ? (
				<Skeleton className="mt-4 h-40 w-full" />
			) : weeks.length === 0 || isEmpty ? (
				<DashboardSectionEmpty>
					Nenhum projeto recebido ou decidido no período.
				</DashboardSectionEmpty>
			) : (
				<div className="flex flex-col gap-4 pt-5">
					<ul aria-label="Legenda" className="flex gap-5">
						{LEGEND.map(({ label, className: swatch }) => (
							<li
								key={label}
								className="flex items-center gap-2 font-mono text-2xs tracking-[0.11em] text-muted-foreground uppercase"
							>
								<span aria-hidden="true" className={`size-2.5 ${swatch}`} />
								{label}
							</li>
						))}
					</ul>
					<ol className="flex h-40 items-end gap-2 overflow-x-auto">
						{weeks.map(({ weekStart, received, decided }) => (
							<li
								key={weekStart}
								aria-label={`Semana de ${weekLabel(weekStart)}: ${received} recebidos, ${decided} decididos`}
								className="flex h-full min-w-8 flex-1 flex-col items-center gap-1.5"
							>
								<div
									aria-hidden="true"
									className="flex w-full flex-1 items-end justify-center gap-0.5"
								>
									<div
										className="w-2.5 bg-info"
										style={{ height: `${(received / max) * 100}%` }}
									/>
									<div
										className="w-2.5 bg-primary"
										style={{ height: `${(decided / max) * 100}%` }}
									/>
								</div>
								<span
									aria-hidden="true"
									className="font-mono text-2xs text-faint-foreground"
								>
									{weekLabel(weekStart)}
								</span>
							</li>
						))}
					</ol>
				</div>
			)}
		</DashboardSection>
	);
};
