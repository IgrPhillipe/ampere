import { Skeleton } from "@components/ui/skeleton";

interface SkeletonTableProps {
	columns: number;
	rows?: number;
}

export const SkeletonTable = ({ columns, rows = 5 }: SkeletonTableProps) => (
	<div className="flex flex-col gap-3 rounded-md border border-border bg-card p-4 shadow-sm">
		{Array.from({ length: rows }, (_, row) => (
			<div key={row} className="flex gap-4">
				{Array.from({ length: columns }, (_, column) => (
					<Skeleton key={column} className="h-10 flex-1 rounded-sm" />
				))}
			</div>
		))}
	</div>
);
