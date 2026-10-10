import { CountBadge } from "@components/CountBadge";

interface PendingFindingsBadgeProps {
	count: number;
}

export const PendingFindingsBadge = ({ count }: PendingFindingsBadgeProps) => (
	<CountBadge
		count={count}
		singular="Pendência"
		plural="Pendências"
		empty="Sem pendências"
		variant="destructive"
	/>
);
