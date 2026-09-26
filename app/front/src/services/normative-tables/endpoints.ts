export const NormativeTableEndpoints = {
	codes: "admin/normative-tables/codes",
	list: "admin/normative-tables",
	create: "admin/normative-tables",
	detail: (id: string) => `admin/normative-tables/${id}`,
	publish: (id: string) => `admin/normative-tables/${id}/publish`,
} as const;
