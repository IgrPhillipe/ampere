import { EmptyState } from "@components/EmptyState";
import { SkeletonTable } from "@components/SkeletonTable";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@components/ui/table";
import { cn } from "@lib/utils";
import {
	type RowData,
	type TableOptions,
	useTable,
} from "@tanstack/react-table";
import type { ReactNode } from "react";

import { type DataTableFeatures, dataTableFeatures } from "./table-features";

interface DataTableProps<TData extends RowData, TColumnId extends string> {
	columns: TableOptions<DataTableFeatures, TData>["columns"];
	data: TData[];
	isLoading?: boolean;
	emptyTitle?: string;
	emptyDescription?: ReactNode;
	/** Replaces the EmptyState built from props. */
	empty?: ReactNode;
	/** Class per column, keyed to the ids the caller declared. */
	columnClassNames?: Partial<Record<TColumnId, string>>;
	/** Rows after the data; while present, an empty `data` still renders the table. */
	trailingRows?: ReactNode;
	className?: string;
}

export const DataTable = <TData extends RowData, TColumnId extends string>({
	columns,
	data,
	isLoading = false,
	emptyTitle = "Nenhum resultado encontrado",
	emptyDescription,
	empty,
	columnClassNames,
	trailingRows,
	className,
}: DataTableProps<TData, TColumnId>) => {
	const table = useTable({ features: dataTableFeatures, columns, data });

	if (isLoading) return <SkeletonTable columns={columns.length} />;

	if (data.length === 0 && !trailingRows) {
		return (
			empty ?? <EmptyState title={emptyTitle} description={emptyDescription} />
		);
	}

	return (
		<div className={cn("overflow-x-auto bg-card", className)}>
			<Table className={cn(columnClassNames && "table-fixed")}>
				<TableHeader>
					{table.getHeaderGroups().map((group) => (
						<TableRow key={group.id}>
							{group.headers.map((header) => (
								<TableHead
									key={header.id}
									className={columnClassNames?.[header.column.id as TColumnId]}
								>
									{header.isPlaceholder ? null : (
										<table.FlexRender header={header} />
									)}
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>

				<TableBody>
					{table.getRowModel().rows.map((row) => (
						<TableRow key={row.id}>
							{row.getAllCells().map((cell) => (
								<TableCell
									key={cell.id}
									className={columnClassNames?.[cell.column.id as TColumnId]}
								>
									<table.FlexRender cell={cell} />
								</TableCell>
							))}
						</TableRow>
					))}

					{trailingRows}
				</TableBody>
			</Table>
		</div>
	);
};
