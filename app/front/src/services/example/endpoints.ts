export const ExampleEndpoints = {
	list: "example/list",
	detail: (id: string) => `example/${id}`,
} as const;
