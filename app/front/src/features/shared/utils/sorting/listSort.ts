import type { SortDirection } from "../../schemas";

export interface ListSort<TColumn extends string> {
	column: TColumn;
	direction: SortDirection;
}

/** Each column's natural direction, the one a first click on it applies. */
export type SortDirections<TColumn extends string> = Record<
	TColumn,
	SortDirection
>;

export const flipDirection = (direction: SortDirection): SortDirection =>
	direction === "ASC" ? "DESC" : "ASC";

/** Clicking the sorted column flips it; any other column starts in its natural direction. */
export const nextSort = <TColumn extends string>(
	current: ListSort<TColumn>,
	column: TColumn,
	directions: SortDirections<TColumn>,
): ListSort<TColumn> =>
	column === current.column
		? { column, direction: flipDirection(current.direction) }
		: { column, direction: directions[column] };
