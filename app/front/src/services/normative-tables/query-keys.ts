import type {
	CompareNormativeTableRevisionsParams,
	ListNormativeTablesParams,
} from "./types";

export const normativeTableKeys = {
	all: () => ["normative-tables"] as const,
	codes: () => [...normativeTableKeys.all(), "codes"] as const,
	lists: () => [...normativeTableKeys.all(), "list"] as const,
	list: (params: ListNormativeTablesParams = {}) =>
		[...normativeTableKeys.lists(), params] as const,
	detail: (id: string) => [...normativeTableKeys.all(), "detail", id] as const,
	revisions: (id: string) =>
		[...normativeTableKeys.all(), "revisions", id] as const,
	compare: ({ id, from, to }: CompareNormativeTableRevisionsParams) =>
		[...normativeTableKeys.revisions(id), "compare", from, to] as const,
};
