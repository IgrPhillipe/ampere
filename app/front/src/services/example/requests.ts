import type { ApiResponse } from "@features/shared";
import { http } from "@lib/http";

import { ExampleEndpoints as e } from "./endpoints";
import type { Example, ExampleList } from "./schemas";

export const getExampleList = () =>
	http.get(e.list).json<ApiResponse<ExampleList>>();

export const getExample = (id: string) =>
	http.get(e.detail(id)).json<ApiResponse<Example>>();
