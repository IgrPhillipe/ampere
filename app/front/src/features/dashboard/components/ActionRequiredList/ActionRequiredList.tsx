import { Skeleton } from "@components/ui/skeleton";
import { padCount } from "@features/shared";
import { cn } from "@lib/utils";
import type { ActionRequiredItem } from "@services/dashboard";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { DashboardSection, DashboardSectionEmpty } from "../DashboardSection";

const describeItem = ({
	status,
	blockingFindings,
	idleDays,
}: ActionRequiredItem) => {
	if (status === "REJECTED") {
		return `${padCount(blockingFindings)} ${blockingFindings === 1 ? "bloqueante" : "bloqueantes"}`;
	}

	if (idleDays === null) return null;

	return `Parado há ${idleDays === 1 ? "1 dia" : `${idleDays} dias`}`;
};

const linkClassName =
	"group inline-flex items-center gap-1.5 self-start text-sm font-medium hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

const linkArrow = (
	<ArrowRight
		aria-hidden="true"
		className="size-3.5 transition-transform group-hover:translate-x-0.5"
	/>
);

interface ActionRequiredListProps {
	items?: ActionRequiredItem[];
	className?: string;
}

export const ActionRequiredList = ({
	items,
	className,
}: ActionRequiredListProps) => (
	<DashboardSection title="Exige Ação" className={className}>
		{!items ? (
			<div className="flex flex-col gap-4 py-4">
				<Skeleton className="h-16 w-full" />
				<Skeleton className="h-16 w-full" />
			</div>
		) : items.length === 0 ? (
			<DashboardSectionEmpty>Nada exige sua ação agora.</DashboardSectionEmpty>
		) : (
			<ul className="flex flex-col">
				{items.map((item) => {
					const isRejected = item.status === "REJECTED";
					const detail = describeItem(item);

					return (
						<li
							key={item.id}
							className="border-b border-border py-4 last:border-b-0"
						>
							<div
								className={cn(
									"flex flex-col gap-2 border-l-4 pl-4",
									isRejected ? "border-destructive" : "border-warning",
								)}
							>
								<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
									<span className="font-medium">{item.name}</span>
									{detail ? (
										<span
											className={cn(
												"font-mono text-xs tracking-wider uppercase",
												isRejected
													? "text-destructive"
													: "text-muted-foreground",
											)}
										>
											{detail}
										</span>
									) : null}
								</div>
								<span className="font-mono text-xs text-muted-foreground">
									{[item.protocol, isRejected ? "Reprovado" : "Rascunho"]
										.filter(Boolean)
										.join(", ")}
								</span>
								<Link
									to="/projetos/$id"
									params={{ id: item.id }}
									aria-label={`${isRejected ? "Ver apontamentos" : "Continuar rascunho"} de ${item.name}`}
									className={linkClassName}
								>
									{isRejected ? "Ver Apontamentos" : "Continuar Rascunho"}
									{linkArrow}
								</Link>
							</div>
						</li>
					);
				})}
			</ul>
		)}
	</DashboardSection>
);
