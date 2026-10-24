import { formatDate } from "@features/shared";

interface PersonCellProps {
	person: string;
	at?: string | null;
}

export const PersonCell = ({ person, at }: PersonCellProps) => (
	<div className="flex flex-col gap-1 whitespace-normal">
		<span className="text-sm text-foreground">{person}</span>
		{at ? (
			<span className="font-mono text-xs text-muted-foreground">
				{formatDate(at)}
			</span>
		) : null}
	</div>
);
