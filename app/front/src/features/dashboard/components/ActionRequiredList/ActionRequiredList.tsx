import { Badge } from "@components/ui/badge";
import { Skeleton } from "@components/ui/skeleton";
import {
	findingStageLabels,
	projectStatusBadgeVariants,
	projectStatusLabels,
	sectionPath,
	stageSections,
} from "@features/projects";
import { formatDateTime, padCount } from "@features/shared";
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
		if (blockingFindings === 0) return null;

		return `${padCount(blockingFindings)} ${blockingFindings === 1 ? "bloqueante" : "bloqueantes"}`;
	}

	if (idleDays === null) return null;

	return `Parado há ${idleDays === 1 ? "1 dia" : `${idleDays} dias`}`;
};

/** Rejected with no blocking finding left: the project only waits for the resubmission. */
const getShortcut = ({
	status,
	blockingFindings,
	pendingStage,
}: ActionRequiredItem) => {
	if (status === "DRAFT") {
		return pendingStage
			? {
					label: `Continuar em ${findingStageLabels[pendingStage]}`,
					to: sectionPath(stageSections[pendingStage]),
				}
			: { label: "Continuar Rascunho", to: sectionPath("overview") };
	}

	return {
		label: blockingFindings > 0 ? "Ver Apontamentos" : "Reenviar Projeto",
		to: sectionPath("overview"),
	};
};

const describeProject = ({
	protocol,
	version,
	consumerUnits,
}: ActionRequiredItem) =>
	[
		protocol,
		version > 0 ? `v${padCount(version)}` : null,
		`${consumerUnits} ${consumerUnits === 1 ? "UC" : "UCs"}`,
	].filter((part): part is string => part !== null);

const linkClassName =
	"group mt-1 inline-flex items-center gap-1.5 self-start text-[0.8125rem] font-medium underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

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
			<div className="flex flex-col gap-4 py-5">
				<Skeleton className="h-16 w-full" />
				<Skeleton className="h-16 w-full" />
			</div>
		) : items.length === 0 ? (
			<DashboardSectionEmpty>Nada exige sua ação agora.</DashboardSectionEmpty>
		) : (
			<ul className="flex flex-col">
				{items.map((item) => {
					const detail = describeItem(item);
					const shortcut = getShortcut(item);

					return (
						<li
							key={item.id}
							className="border-b border-border py-5 last:border-b-0"
						>
							<div className="flex flex-col gap-2 border-l-2 border-attention pl-4">
								<div className="flex items-baseline justify-between gap-4">
									<span className="text-base font-medium">{item.name}</span>
									{detail ? (
										<span className="shrink-0 font-mono text-2xs tracking-[0.11em] whitespace-nowrap text-faint-foreground uppercase">
											{detail}
										</span>
									) : null}
								</div>
								<div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
									<Badge
										variant={projectStatusBadgeVariants[item.status]}
										className="text-foreground"
									>
										{projectStatusLabels[item.status]}
									</Badge>
									{item.rejectedAt ? (
										<span className="font-mono text-xs text-muted-foreground">
											em {formatDateTime(item.rejectedAt).date}
										</span>
									) : null}
									{describeProject(item).map((part) => (
										<span
											key={part}
											className="font-mono text-xs text-muted-foreground"
										>
											{part}
										</span>
									))}
								</div>
								<Link
									to={shortcut.to}
									params={{ id: item.id }}
									aria-label={`${shortcut.label} de ${item.name}`}
									className={linkClassName}
								>
									{shortcut.label}
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
