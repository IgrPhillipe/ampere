import {
	columnFilteringFeature,
	createColumnHelper,
	globalFilteringFeature,
	type RowData,
	rowPaginationFeature,
	rowSortingFeature,
	tableFeatures,
} from "@tanstack/react-table";

export const dataTableFeatures = tableFeatures({
	columnFilteringFeature,
	globalFilteringFeature,
	rowPaginationFeature,
	rowSortingFeature,
});

export type DataTableFeatures = typeof dataTableFeatures;

/** Creates the column helper already bound to the features above. */
export const createDataTableColumnHelper = <TData extends RowData>() =>
	createColumnHelper<DataTableFeatures, TData>();
