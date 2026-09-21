import { z } from "zod";

export const paginationSchema = z.object({
	total: z.number().int().nonnegative(),
	page: z.number().int().positive(),
	pageSize: z.number().int().positive(),
});

/** Envelope padrao das respostas da API, num lugar so. */
export const apiResponseSchema = <T extends z.ZodType>(data: T) =>
	z.object({ data, pagination: paginationSchema.optional() });

/** Envelope de resposta paginada: a paginacao deixa de ser opcional. */
export const paginatedResponseSchema = <T extends z.ZodType>(data: T) =>
	z.object({ data, pagination: paginationSchema });

export type Pagination = z.infer<typeof paginationSchema>;

export interface ApiResponse<T> {
	data: T;
	pagination?: Pagination;
}
