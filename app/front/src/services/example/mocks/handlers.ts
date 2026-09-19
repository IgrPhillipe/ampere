import { HttpResponse, http } from "msw";

import { ExampleEndpoints as e } from "../endpoints";
import { makeExample, makeExampleList } from "./factories";

const url = (path: string) => `/api/${path}`;

export const exampleHandlers = [
	http.get(url(e.list), () => HttpResponse.json(makeExampleList())),
	http.get(url(e.detail(":id")), ({ params }) =>
		HttpResponse.json(makeExample({ id: params.id as string })),
	),
];
