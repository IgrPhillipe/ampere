import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { submitProject } from "./requests";

vi.mock("@lib/http", async () => {
	const { http } =
		await vi.importActual<typeof import("@lib/http")>("@lib/http");

	// Node does not resolve the relative "/api" prefix the browser uses.
	return { http: http.extend({ prefix: "http://localhost/api" }) };
});

let sentBody: string | undefined;

const fetchMock = vi.fn(async (request: Request) => {
	sentBody = await request.text();

	return Response.json({ data: {} });
});

describe("submitProject", () => {
	beforeEach(() => vi.stubGlobal("fetch", fetchMock));
	afterEach(() => vi.unstubAllGlobals());

	it("sends the first submission without a body", async () => {
		await submitProject({ projectId: "4" }).catch(() => undefined);

		expect(sentBody).toBe("");
	});

	it("sends the change summary on a resubmission", async () => {
		await submitProject({
			projectId: "4",
			changeSummary: "Substituí a ART.",
		}).catch(() => undefined);

		expect(JSON.parse(sentBody ?? "")).toEqual({
			changeSummary: "Substituí a ART.",
		});
	});
});
