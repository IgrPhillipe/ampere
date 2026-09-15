import { Skeleton } from "@components/ui/skeleton";

interface SkeletonTableProps {
	columns: number;
	rows?: number;
}

export const SkeletonTable = ({ columns, rows = 5 }: SkeletonTableProps) => (
	<div className="flex flex-col gap-2 rounded-md border bg-background p-4">
		{Array.from({ length: rows }, (_, row) => (
			<div key={row} className="flex gap-3">
				{Array.from({ length: columns }, (_, column) => (
					<Skeleton key={column} className="h-8 flex-1" />
				))}
			</div>
		))}
	</div>
);
