export const NormativeTableEndpoints = {
	codes: "normative-tables/codes",
	list: "normative-tables",
	create: "normative-tables",
	detail: (id: string) => `normative-tables/${id}`,
	publication: (id: string) => `normative-tables/${id}/publication`,
	revisions: (id: string) => `normative-tables/${id}/revisions`,
	compare: (id: string) => `normative-tables/${id}/revisions/compare`,
} as const;
