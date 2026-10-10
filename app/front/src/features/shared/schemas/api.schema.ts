import { z } from "zod";

export const paginationSchema = z.object({
	total: z.number().int().nonnegative(),
	page: z.number().int().positive(),
	pageSize: z.number().int().positive(),
});

export const apiResponseSchema = <T extends z.ZodType>(data: T) =>
	z.object({ data, pagination: paginationSchema.optional() });

/** Paginated response envelope: pagination stops being optional. */
export const paginatedResponseSchema = <T extends z.ZodType>(data: T) =>
	z.object({ data, pagination: paginationSchema });

export type Pagination = z.infer<typeof paginationSchema>;

export interface ApiResponse<T> {
	data: T;
	pagination?: Pagination;
}

/** A listing's single sort key, in one direction or the other: `sort=ASC|DESC`. */
export const sortDirectionSchema = z.enum(["ASC", "DESC"]);

export type SortDirection = z.infer<typeof sortDirectionSchema>;
