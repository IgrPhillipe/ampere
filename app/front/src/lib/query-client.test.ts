import { describe, expect, it } from "vitest";

import { httpErrorOf } from "@/test/fixtures/http-error";

import { queryClient } from "./query-client";

const retry = queryClient.getDefaultOptions().queries?.retry as (
	failureCount: number,
	error: unknown,
) => boolean;

describe("queryClient", () => {
	it("does not retry a missing resource", async () => {
		expect(retry(0, await httpErrorOf(404, {}))).toBe(false);
	});

	it("retries any other failure once", async () => {
		const error = await httpErrorOf(500, {});

		expect(retry(0, error)).toBe(true);
		expect(retry(1, error)).toBe(false);
		expect(retry(0, new TypeError("Failed to fetch"))).toBe(true);
	});
});
