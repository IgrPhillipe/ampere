import { cn } from "@lib/utils";
import type { Finding } from "@services/project-review";

import {
	describeFindingReference,
	type FindingReferenceOptions,
	findingStageLabels,
} from "../../constants";

interface ReservationListProps {
	reservations: Finding[];
	referenceOptions: FindingReferenceOptions;
	className?: string;
}

/** Adjustments an approved project carries without a new review. */
export const ReservationList = ({
	reservations,
	referenceOptions,
	className,
}: ReservationListProps) => (
	<ul className={cn("flex flex-col divide-y divide-border", className)}>
		{reservations.map((reservation) => {
			const reference = describeFindingReference(reservation, referenceOptions);

			return (
				<li key={reservation.id} className="flex flex-col gap-1 py-3">
					<p className="flex flex-wrap gap-x-3 font-mono text-2xs tracking-[0.11em] text-faint-foreground uppercase">
						<span>{findingStageLabels[reservation.stage]}</span>
						{reference ? <span>{reference}</span> : null}
					</p>
					<p className="text-sm leading-relaxed text-foreground">
						{reservation.description}
					</p>
					{reservation.standardItem ? (
						<p className="font-mono text-xs text-faint-foreground">
							{reservation.standardItem}
						</p>
					) : null}
				</li>
			);
		})}
	</ul>
);
