import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { exportProjectListCsv } from "./requests";

vi.mock("@lib/http", async () => {
	const { filenameOf, http } =
		await vi.importActual<typeof import("@lib/http")>("@lib/http");

	return { filenameOf, http: http.extend({ prefix: "http://localhost/api" }) };
});

let requestUrl = "";

const fetchMock = vi.fn(async (request: Request) => {
	requestUrl = request.url;

	return new Response("protocol,name", {
		headers: {
			"Content-Disposition": 'attachment; filename="projetos.csv"',
		},
	});
});

describe("exportProjectListCsv", () => {
	beforeEach(() => {
		requestUrl = "";
		vi.stubGlobal("fetch", fetchMock);
	});
	afterEach(() => vi.unstubAllGlobals());

	it("exports filtered projects without pagination parameters", async () => {
		const file = await exportProjectListCsv({
			page: 3,
			pageSize: 10,
			status: ["DRAFT", "APPROVED"],
			search: "subestação",
			sort: "name",
			direction: "ASC",
			state: ["PE"],
		});
		const url = new URL(requestUrl);

		expect(url.pathname).toBe("/api/projects/export.csv");
		expect(url.searchParams.getAll("status")).toEqual(["DRAFT", "APPROVED"]);
		expect(url.searchParams.get("search")).toBe("subestação");
		expect(url.searchParams.get("sort")).toBe("name");
		expect(url.searchParams.get("direction")).toBe("ASC");
		expect(url.searchParams.get("state")).toBe("PE");
		expect(url.searchParams.has("page")).toBe(false);
		expect(url.searchParams.has("pageSize")).toBe(false);
		expect(file.filename).toBe("projetos.csv");
		expect(await file.blob.text()).toBe("protocol,name");
	});
});
