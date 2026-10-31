import { ExpandableText } from "@components/ExpandableText";
import { Button } from "@components/ui/button";
import { Skeleton } from "@components/ui/skeleton";
import type { SortDirection } from "@features/shared";
import dayjs from "@lib/dayjs";
import { cn } from "@lib/utils";
import type { ProjectEvent } from "@services/project-events";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { ReactNode } from "react";

import { eventAuthorRoleLabel, eventLabel } from "../../constants";

const titleId = "linha-do-tempo-titulo";

interface EventItemProps {
	event: ProjectEvent;
	latest: boolean;
}

const EventItem = ({ event, latest }: EventItemProps) => {
	const occurredAt = dayjs(event.occurredAt);
	const role = eventAuthorRoleLabel(event);

	return (
		<li className="grid grid-cols-[5.5rem_auto_minmax(0,1fr)] gap-x-4 border-b border-border py-4 sm:gap-x-6">
			<time
				dateTime={event.occurredAt}
				className="flex flex-col gap-0.5 font-mono text-xs"
			>
				<span className="font-medium text-foreground">
					{occurredAt.format("DD.MM.YYYY")}
				</span>
				<span className="text-muted-foreground">
					{occurredAt.format("HH[H]mm")}
				</span>
			</time>

			<span
				aria-hidden="true"
				className={cn(
					"mt-1 size-2 rounded-full border",
					latest
						? "border-foreground bg-foreground"
						: "border-muted-foreground bg-card",
				)}
			/>

			<div className="flex min-w-0 flex-col gap-1">
				<p className="font-mono text-xs tracking-[0.08em] text-foreground uppercase">
					{eventLabel(event)}
					{latest ? <span className="sr-only"> (mais recente)</span> : null}
				</p>
				<p className="text-sm text-foreground">{event.description}</p>
				{event.detail ? (
					<ExpandableText
						text={event.detail}
						className="text-muted-foreground"
					/>
				) : null}
				<p className="text-xs text-muted-foreground">
					{event.authorName ? (
						<>
							{event.authorName} · <span className="lowercase">{role}</span>
						</>
					) : (
						role
					)}
				</p>
			</div>
		</li>
	);
};

interface ProjectTimelineProps {
	events?: ProjectEvent[];
	direction: SortDirection;
	onDirectionChange: (direction: SortDirection) => void;
	isLoading?: boolean;
	/** Shown in place of the list when the project has no events. */
	empty?: ReactNode;
	className?: string;
}

/** The protocol's events, newest or oldest first; the API sorts them. */
export const ProjectTimeline = ({
	events,
	direction,
	onDirectionChange,
	isLoading = false,
	empty,
	className,
}: ProjectTimelineProps) => {
	const newestFirst = direction === "DESC";
	const latestIndex = newestFirst ? 0 : (events?.length ?? 0) - 1;
	const DirectionIcon = newestFirst ? ArrowDown : ArrowUp;

	return (
		<section
			aria-labelledby={titleId}
			className={cn("flex flex-col", className)}
		>
			<div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-foreground pb-3">
				<h2 id={titleId} className="text-lg font-semibold text-foreground">
					Linha do Tempo do Protocolo
				</h2>
				<Button
					type="button"
					variant="outline"
					size="xs"
					aria-pressed={newestFirst}
					disabled={isLoading || !events?.length}
					onClick={() => onDirectionChange(newestFirst ? "ASC" : "DESC")}
					className="font-mono tracking-[0.08em] uppercase"
				>
					Mais Recente Primeiro
					<DirectionIcon aria-hidden="true" />
				</Button>
			</div>

			{isLoading || !events ? (
				<div className="mt-4 flex flex-col gap-3">
					{Array.from({ length: 4 }, (_, index) => (
						<Skeleton key={index} className="h-16 w-full" />
					))}
				</div>
			) : events.length === 0 ? (
				<div className="mt-6">{empty}</div>
			) : (
				<ol aria-live="polite" className="flex flex-col">
					{events.map((event, index) => (
						<EventItem
							key={event.id}
							event={event}
							latest={index === latestIndex}
						/>
					))}
				</ol>
			)}
		</section>
	);
};
