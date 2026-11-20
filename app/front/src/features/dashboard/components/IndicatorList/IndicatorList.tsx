import { Skeleton } from "@components/ui/skeleton";
import type { ReactNode } from "react";

import { DashboardSection, DashboardSectionEmpty } from "../DashboardSection";

export interface IndicatorListItem {
	key: string;
	label: ReactNode;
	value: string;
}

interface IndicatorListProps {
	title: string;
	caption?: string;
	/** Without `items` the section shows skeletons. */
	items?: IndicatorListItem[];
	emptyMessage: string;
	className?: string;
}

/** A titled list of labels and mono figures, for the panel's smaller indicators. */
export const IndicatorList = ({
	title,
	caption,
	items,
	emptyMessage,
	className,
}: IndicatorListProps) => (
	<DashboardSection title={title} caption={caption} className={className}>
		{!items ? (
			<div className="flex flex-col gap-3 py-4">
				<Skeleton className="h-6 w-full" />
				<Skeleton className="h-6 w-full" />
			</div>
		) : items.length === 0 ? (
			<DashboardSectionEmpty>{emptyMessage}</DashboardSectionEmpty>
		) : (
			<dl className="flex flex-col">
				{items.map(({ key, label, value }) => (
					<div
						key={key}
						className="flex items-baseline justify-between gap-4 border-b border-border py-3 last:border-b-0"
					>
						<dt className="text-sm text-muted-foreground">{label}</dt>
						<dd className="font-mono text-sm font-semibold whitespace-nowrap">
							{value}
						</dd>
					</div>
				))}
			</dl>
		)}
	</DashboardSection>
);
