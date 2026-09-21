import { z } from "zod";

export const paginationSchema = z.object({
	total: z.number().int().nonnegative(),
	page: z.number().int().positive(),
	pageSize: z.number().int().positive(),
});

/** Standard envelope of the API responses, in one place. */
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
