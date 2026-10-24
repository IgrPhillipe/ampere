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
import type { ListSort, SortDirection } from "@features/shared";
import { cn } from "@lib/utils";
import {
	type RowData,
	type TableOptions,
	useTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { ReactNode } from "react";

import { type DataTableFeatures, dataTableFeatures } from "./table-features";

interface DataTableProps<
	TData extends RowData,
	TColumnId extends string,
	TSortColumn extends TColumnId = TColumnId,
> {
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
	/** Mouse shortcut only: keep a button inside the row for keyboard users. */
	onRowClick?: (row: TData) => void;
	/** Columns whose header sorts the list; the sorting itself happens in the API. */
	sortableColumns?: readonly TSortColumn[];
	sort?: ListSort<TSortColumn>;
	onSortChange?: (column: TSortColumn) => void;
	/** Classes of the `table`, such as a minimum width that scrolls on narrow screens. */
	tableClassName?: string;
	className?: string;
}

const ariaSort = (direction: SortDirection | undefined) =>
	direction === "ASC"
		? "ascending"
		: direction === "DESC"
			? "descending"
			: "none";

const SortIcon = ({ direction }: { direction: SortDirection | undefined }) => {
	const Icon =
		direction === "ASC"
			? ArrowUp
			: direction === "DESC"
				? ArrowDown
				: ArrowUpDown;

	return (
		<Icon
			aria-hidden="true"
			className={cn("size-3.5 shrink-0", !direction && "opacity-40")}
		/>
	);
};

export const DataTable = <
	TData extends RowData,
	TColumnId extends string,
	TSortColumn extends TColumnId = TColumnId,
>({
	columns,
	data,
	isLoading = false,
	emptyTitle = "Nenhum resultado encontrado",
	emptyDescription,
	empty,
	columnClassNames,
	trailingRows,
	onRowClick,
	sortableColumns,
	sort,
	onSortChange,
	tableClassName,
	className,
}: DataTableProps<TData, TColumnId, TSortColumn>) => {
	const table = useTable({ features: dataTableFeatures, columns, data });

	if (isLoading) return <SkeletonTable columns={columns.length} />;

	if (data.length === 0 && !trailingRows) {
		return (
			empty ?? <EmptyState title={emptyTitle} description={emptyDescription} />
		);
	}

	return (
		<div className={cn("overflow-x-auto bg-card", className)}>
			<Table className={cn(columnClassNames && "table-fixed", tableClassName)}>
				<TableHeader>
					{table.getHeaderGroups().map((group) => (
						<TableRow key={group.id}>
							{group.headers.map((header) => {
								const columnId = header.column.id as TColumnId;
								const sortColumn = sortableColumns?.find(
									(column) => column === columnId,
								);
								const sortable =
									!header.isPlaceholder &&
									onSortChange !== undefined &&
									sortColumn !== undefined;
								const direction =
									sort?.column === columnId ? sort.direction : undefined;

								return (
									<TableHead
										key={header.id}
										aria-sort={sortable ? ariaSort(direction) : undefined}
										className={columnClassNames?.[columnId]}
									>
										{header.isPlaceholder ? null : sortable ? (
											<button
												type="button"
												onClick={() => onSortChange(sortColumn)}
												className={cn(
													"-mx-1 inline-flex items-center gap-1.5 rounded-sm px-1 py-1 uppercase tracking-[inherit] transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
													direction && "text-foreground",
												)}
											>
												<table.FlexRender header={header} />
												<SortIcon direction={direction} />
											</button>
										) : (
											<table.FlexRender header={header} />
										)}
									</TableHead>
								);
							})}
						</TableRow>
					))}
				</TableHeader>

				<TableBody>
					{table.getRowModel().rows.map((row) => (
						<TableRow
							key={row.id}
							onClick={onRowClick ? () => onRowClick(row.original) : undefined}
							className={cn(onRowClick && "cursor-pointer")}
						>
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
