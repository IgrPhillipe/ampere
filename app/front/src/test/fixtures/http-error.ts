import { http } from "@lib/http";
import { vi } from "vitest";

/** A real ky `HTTPError`, with the body parsed into `data` as the app sees it. */
export const httpErrorOf = async (status: number, body: object) => {
	const fetchMock = vi.fn(async () => Response.json(body, { status }));
	const api = http.extend({
		prefix: "http://localhost/api",
		retry: 0,
		fetch: fetchMock,
	});

	return api.post("test").catch((error: unknown) => error);
};
