import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { exportCalculationSpreadsheet } from "./requests";

vi.mock("@lib/http", async () => {
	const { filenameOf, http } =
		await vi.importActual<typeof import("@lib/http")>("@lib/http");

	return { filenameOf, http: http.extend({ prefix: "http://localhost/api" }) };
});

let requestUrl = "";

const fetchMock = vi.fn(async (request: Request) => {
	requestUrl = request.url;

	return new Response("xlsx", {
		headers: {
			"Content-Disposition": 'attachment; filename="2026-1008-calculo.xlsx"',
		},
	});
});

describe("exportCalculationSpreadsheet", () => {
	beforeEach(() => {
		requestUrl = "";
		vi.stubGlobal("fetch", fetchMock);
	});
	afterEach(() => vi.unstubAllGlobals());

	it("downloads the calculation spreadsheet using the API filename", async () => {
		const file = await exportCalculationSpreadsheet("14");

		expect(requestUrl).toBe(
			"http://localhost/api/projects/14/calculation.xlsx",
		);
		expect(file.filename).toBe("2026-1008-calculo.xlsx");
		expect(await file.blob.text()).toBe("xlsx");
	});
});
