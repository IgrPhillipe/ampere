export const NormativeTableEndpoints = {
	codes: "normative-tables/codes",
	list: "normative-tables",
	create: "normative-tables",
	detail: (id: string) => `normative-tables/${id}`,
	publication: (id: string) => `normative-tables/${id}/publication`,
} as const;
