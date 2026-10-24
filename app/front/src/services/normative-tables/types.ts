import type { SortDirection } from "@features/shared";

import type { NormativeTableSort, NormativeTableStatus } from "./schemas";

export interface ListNormativeTablesParams {
	search?: string;
	status?: NormativeTableStatus;
	sort?: NormativeTableSort;
	direction?: SortDirection;
}

export interface NormativeTableRowPayload {
	key?: string | null;
	lowerBound?: number | null;
	upperBound?: number | null;
	value: number;
	secondValue?: number | null;
	thirdValue?: number | null;
	label?: string | null;
}

export interface NormativeTablePayload {
	code: string;
	identification: string;
	item: string;
	page: string;
	rows: NormativeTableRowPayload[];
}
