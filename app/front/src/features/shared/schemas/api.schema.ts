import { z } from "zod";

export const paginationSchema = z.object({
	total: z.number().int().nonnegative(),
	page: z.number().int().positive(),
	pageSize: z.number().int().positive(),
});

/**
 * Envelope padrao das respostas da API, num lugar so.
 *
 * Estava declarado duas vezes sem nada que ligasse as duas: interface escrita a
 * mao em `shared/types` e a mesma forma redeclarada inline no schema de
 * projetos. Se uma mudasse, a outra nao acusava — e o `convencoes-back.md`
 * lista justamente o envelope entre os contratos que quebram em silencio.
 */
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
