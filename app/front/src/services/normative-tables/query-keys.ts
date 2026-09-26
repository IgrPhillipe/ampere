export const normativeTableKeys = {
	all: () => ["normative-tables"] as const,
	codes: () => [...normativeTableKeys.all(), "codes"] as const,
	list: () => [...normativeTableKeys.all(), "list"] as const,
	detail: (id: string) => [...normativeTableKeys.all(), "detail", id] as const,
};
