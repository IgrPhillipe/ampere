import { ExpandableText } from "@components/ExpandableText";
import { SectionHeading } from "@components/SectionHeading";
import { Button } from "@components/ui/button";
import { Skeleton } from "@components/ui/skeleton";
import {
	formatDate,
	formatDateTime,
	type SortDirection,
} from "@features/shared";
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
	const occurredAt = formatDateTime(event.occurredAt);
	const role = eventAuthorRoleLabel(event);

	return (
		<li className="grid grid-cols-[6.5rem_auto_minmax(0,1fr)] gap-x-5 border-b border-border py-4 sm:gap-x-6">
			<time
				dateTime={event.occurredAt}
				className="flex flex-col gap-1 font-mono"
			>
				<span className="text-sm text-foreground">{occurredAt.date}</span>
				<span className="text-2xs tracking-[0.11em] text-faint-foreground">
					{occurredAt.time}
				</span>
			</time>

			<span
				aria-hidden="true"
				className={cn(
					"mt-1.5 size-1.5 rounded-full border",
					latest
						? "border-foreground bg-foreground"
						: "border-faint-foreground bg-card",
				)}
			/>

			<div className="flex min-w-0 flex-col gap-1">
				<p className="font-mono text-2xs tracking-[0.11em] text-foreground uppercase">
					{eventLabel(event)}
					{latest ? <span className="sr-only"> (mais recente)</span> : null}
				</p>
				<p className="text-sm text-foreground">{event.description}</p>
				{event.reviewDeadline ? (
					<p className="text-sm text-foreground">
						Retorno até {formatDate(event.reviewDeadline)}
					</p>
				) : null}
				{event.detail ? (
					<ExpandableText
						text={event.detail}
						className="text-muted-foreground"
					/>
				) : null}
				<p className="text-xs text-faint-foreground">
					{event.authorName ? (
						<>
							{event.authorName}, <span className="lowercase">{role}</span>
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
	empty?: ReactNode;
	className?: string;
}

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
			<SectionHeading
				id={titleId}
				actions={
					<Button
						type="button"
						variant="outline"
						size="xs"
						aria-pressed={newestFirst}
						disabled={isLoading || !events?.length}
						onClick={() => onDirectionChange(newestFirst ? "ASC" : "DESC")}
						className="border-border-strong font-mono text-2xs font-normal tracking-[0.11em] uppercase aria-pressed:bg-transparent aria-pressed:text-foreground"
					>
						Mais Recente Primeiro
						<DirectionIcon aria-hidden="true" />
					</Button>
				}
			>
				Linha do Tempo do Protocolo
			</SectionHeading>

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
