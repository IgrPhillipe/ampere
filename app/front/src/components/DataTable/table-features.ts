import {
	columnFilteringFeature,
	createColumnHelper,
	globalFilteringFeature,
	type RowData,
	rowPaginationFeature,
	rowSortingFeature,
	tableFeatures,
} from "@tanstack/react-table";

/** Features ligadas no `DataTable`. */
export const dataTableFeatures = tableFeatures({
	columnFilteringFeature,
	globalFilteringFeature,
	rowPaginationFeature,
	rowSortingFeature,
});

export type DataTableFeatures = typeof dataTableFeatures;

/** Cria o helper de colunas ja amarrado nas features acima. */
export const createDataTableColumnHelper = <TData extends RowData>() =>
	createColumnHelper<DataTableFeatures, TData>();
