import {
	columnFilteringFeature,
	createColumnHelper,
	globalFilteringFeature,
	type RowData,
	rowPaginationFeature,
	rowSortingFeature,
	tableFeatures,
} from "@tanstack/react-table";

/**
 * Features ligadas no `DataTable`.
 *
 * A v9 do TanStack Table exige registrar cada feature explicitamente — nada
 * vem por padrao alem do core. Para ligar outra (selecao de linha, colunas
 * fixas, etc.), acrescente aqui e o tipo se propaga sozinho.
 */
export const dataTableFeatures = tableFeatures({
	columnFilteringFeature,
	globalFilteringFeature,
	rowPaginationFeature,
	rowSortingFeature,
});

export type DataTableFeatures = typeof dataTableFeatures;

/**
 * Cria o helper de colunas ja amarrado nas features acima.
 *
 * ```ts
 * const helper = createDataTableColumnHelper<Projeto>();
 * const columns = helper.columns([helper.accessor("nome", { header: "Nome" })]);
 * ```
 */
export const createDataTableColumnHelper = <TData extends RowData>() =>
	createColumnHelper<DataTableFeatures, TData>();
