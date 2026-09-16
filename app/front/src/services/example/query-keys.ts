export const exampleKeys = {
	all: () => ["example"] as const,
	lists: () => [...exampleKeys.all(), "list"] as const,
	detail: (id: string) => [...exampleKeys.all(), "detail", id] as const,
};
