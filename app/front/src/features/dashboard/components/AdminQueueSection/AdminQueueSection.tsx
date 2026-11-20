import { SectionHeading } from "@components/SectionHeading";
import { Badge } from "@components/ui/badge";
import { Skeleton } from "@components/ui/skeleton";
import { padCount } from "@features/shared";
import { cn } from "@lib/utils";
import type { AdminDashboardQueueSummary } from "@services/dashboard";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useId } from "react";

const toneClassNames = {
	attention: "text-attention",
	destructive: "text-destructive",
} as const;

interface QueueCounter {
	label: string;
	value: number;
	/** The color a non-zero count takes; zero stays neutral. */
	tone: keyof typeof toneClassNames;
}

interface AdminQueueSectionProps {
	queue?: AdminDashboardQueueSummary;
	isLoading?: boolean;
	className?: string;
}

export const AdminQueueSection = ({
	queue,
	isLoading = false,
	className,
}: AdminQueueSectionProps) => {
	const headingId = useId();

	const counters: QueueCounter[] = [
		{ label: "Sem analista", value: queue?.unassigned ?? 0, tone: "attention" },
		{
			label: "Prazo até 3 dias",
			value: queue?.dueIn3Days ?? 0,
			tone: "attention",
		},
		{ label: "Atrasados", value: queue?.overdue ?? 0, tone: "destructive" },
	];
	const reviewers = queue?.byReviewer ?? [];

	return (
		<section
			aria-labelledby={headingId}
			className={cn("flex flex-col gap-6", className)}
		>
			<div className="flex items-center justify-between border-b border-border pb-3">
				<SectionHeading id={headingId}>Fila de Análise</SectionHeading>
				<Link
					to="/fila-de-analise"
					className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
				>
					Ir para Fila
					<ArrowRight className="size-3.5" aria-hidden="true" />
				</Link>
			</div>

			<div className="grid grid-cols-3 gap-3">
				{counters.map((counter) => (
					<div
						key={counter.label}
						className="flex flex-col justify-between gap-1 border border-border p-3"
					>
						<span className="font-mono text-2xs tracking-[0.11em] text-faint-foreground uppercase">
							{counter.label}
						</span>
						{isLoading || !queue ? (
							<Skeleton className="h-7 w-12" />
						) : (
							<span
								className={cn(
									"font-mono text-2xl font-bold",
									counter.value > 0
										? toneClassNames[counter.tone]
										: "text-foreground",
								)}
							>
								{padCount(counter.value)}
							</span>
						)}
					</div>
				))}
			</div>

			<div className="flex flex-col gap-3">
				<h3 className="font-mono text-2xs font-semibold tracking-[0.11em] text-faint-foreground uppercase">
					Carga por Analista
				</h3>

				{isLoading || !queue ? (
					<div className="flex flex-col gap-2">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
					</div>
				) : reviewers.length === 0 ? (
					<p className="py-4 text-sm text-muted-foreground">
						Nenhum analista cadastrado.
					</p>
				) : (
					<ul className="divide-y divide-border border border-border">
						{reviewers.map((reviewer) => (
							<li
								key={reviewer.id}
								className="flex items-center justify-between px-4 py-3"
							>
								<div className="flex items-center gap-2">
									<span className="text-sm font-medium text-foreground">
										{reviewer.name}
									</span>
									{!reviewer.active && (
										<Badge variant="outline" className="text-faint-foreground">
											Inativo
										</Badge>
									)}
								</div>

								<div className="flex items-center gap-1.5 font-mono text-sm">
									<span className="font-bold text-foreground">
										{padCount(reviewer.underReview)}
									</span>
									<span className="text-2xs text-muted-foreground uppercase">
										{reviewer.underReview === 1 ? "projeto" : "projetos"}
									</span>
								</div>
							</li>
						))}
					</ul>
				)}
			</div>
		</section>
	);
};
