import { Skeleton } from "@components/ui/skeleton";
import { padCount } from "@features/shared";
import { cn } from "@lib/utils";
import type { ReviewDashboardTotals } from "@services/dashboard";
import { useId } from "react";

interface ReviewIndicatorsProps {
	/** Without `totals` the band shows skeletons. */
	totals?: ReviewDashboardTotals;
	periodLabel: string;
	className?: string;
}

const TILES: { key: keyof ReviewDashboardTotals; label: string }[] = [
	{ key: "received", label: "Recebidos" },
	{ key: "approved", label: "Aprovados" },
	{ key: "rejected", label: "Reprovados" },
	{ key: "underReview", label: "Em análise" },
];

/** H12's conclusion field: the period's projects by situation. It does not filter. */
export const ReviewIndicators = ({
	totals,
	periodLabel,
	className,
}: ReviewIndicatorsProps) => {
	const titleId = useId();

	return (
		<section
			aria-labelledby={titleId}
			className={cn("bg-primary text-primary-foreground", className)}
		>
			<h2
				id={titleId}
				className="px-gutter pt-5 font-mono text-2xs tracking-[0.11em] uppercase opacity-85 md:px-gutter-md"
			>
				Projetos do período, {periodLabel}
			</h2>

			<dl className="grid grid-cols-2 lg:grid-cols-4">
				{TILES.map(({ key, label }) => (
					<div
						key={key}
						className="relative flex min-h-26 flex-col-reverse justify-center gap-2 pr-5 pl-gutter odd:after:absolute odd:after:inset-y-5 odd:after:right-0 odd:after:w-px odd:after:bg-primary-foreground/25 md:pl-gutter-md lg:not-last:after:absolute lg:not-last:after:inset-y-5 lg:not-last:after:right-0 lg:not-last:after:w-px lg:not-last:after:bg-primary-foreground/25"
					>
						<dt className="font-mono text-2xs tracking-[0.11em] uppercase opacity-85">
							{label}
						</dt>
						<dd className="font-mono text-[2.125rem] leading-none font-medium tracking-[-0.03em] whitespace-nowrap">
							{totals ? (
								padCount(totals[key])
							) : (
								<Skeleton className="h-10 w-16 bg-primary-foreground/25" />
							)}
						</dd>
					</div>
				))}
			</dl>
		</section>
	);
};
