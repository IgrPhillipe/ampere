import type { ApiResponse } from "@features/shared";

import type { Example, ExampleList } from "../schemas";

export const makeExample = (
	overrides?: Partial<Example>,
): ApiResponse<Example> => ({
	data: { id: "1", name: "Example", ...overrides },
});

export const makeExampleList = (): ApiResponse<ExampleList> => ({
	data: [
		{ id: "1", name: "Example One" },
		{ id: "2", name: "Example Two" },
	],
	pagination: { total: 2, page: 1, pageSize: 20 },
});
