import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { exportReviewQueueCsv } from "./requests";

vi.mock("@lib/http", async () => {
	const { filenameOf, http } =
		await vi.importActual<typeof import("@lib/http")>("@lib/http");

	return { filenameOf, http: http.extend({ prefix: "http://localhost/api" }) };
});

let requestUrl = "";

const fetchMock = vi.fn(async (request: Request) => {
	requestUrl = request.url;

	return new Response("protocol,reviewer", {
		headers: {
			"Content-Disposition": 'attachment; filename="fila-de-analise.csv"',
		},
	});
});

describe("exportReviewQueueCsv", () => {
	beforeEach(() => {
		requestUrl = "";
		vi.stubGlobal("fetch", fetchMock);
	});
	afterEach(() => vi.unstubAllGlobals());

	it("exports the current queue filters without pagination parameters", async () => {
		const file = await exportReviewQueueCsv({
			page: 2,
			pageSize: 10,
			filter: "DUE_SOON",
			search: "Caruaru",
			sort: "deadline",
			direction: "ASC",
			reviewer: "none",
			state: ["PE"],
		});
		const url = new URL(requestUrl);

		expect(url.pathname).toBe("/api/review-queue/export.csv");
		expect(url.searchParams.get("filter")).toBe("DUE_SOON");
		expect(url.searchParams.get("search")).toBe("Caruaru");
		expect(url.searchParams.get("sort")).toBe("deadline");
		expect(url.searchParams.get("direction")).toBe("ASC");
		expect(url.searchParams.get("reviewer")).toBe("none");
		expect(url.searchParams.get("state")).toBe("PE");
		expect(url.searchParams.has("page")).toBe(false);
		expect(url.searchParams.has("pageSize")).toBe(false);
		expect(file.filename).toBe("fila-de-analise.csv");
		expect(await file.blob.text()).toBe("protocol,reviewer");
	});
});
