import { act, renderHook, waitFor } from "@testing-library/react";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { describe, expect, it, vi } from "vitest";

import { useNormativeTableFilters } from "./useNormativeTableFilters";

const renderFilters = (searchParams = "") => {
	const onUrlUpdate = vi.fn();
	const wrapper = withNuqsTestingAdapter({
		searchParams,
		hasMemory: true,
		onUrlUpdate,
	});
	const { result } = renderHook(() => useNormativeTableFilters(), { wrapper });
	const lastUrl = () => onUrlUpdate.mock.lastCall?.[0]?.searchParams;

	return { result, onUrlUpdate, lastUrl };
};

describe("useNormativeTableFilters", () => {
	it("defaults to the catalogue order without filters", () => {
		const { result } = renderFilters("?status=ARCHIVED&sort=rows");

		expect(result.current.sort).toEqual({ column: "code", direction: "ASC" });
		expect(result.current.hasActiveFilters).toBe(false);
		expect(result.current.params).toEqual({
			sort: "code",
			direction: "ASC",
		});
	});

	it("builds the API params from the URL", () => {
		const { result } = renderFilters("?status=DRAFT&sort=verifiedAt");

		expect(result.current.params).toEqual({
			status: "DRAFT",
			sort: "verifiedAt",
			direction: "DESC",
		});
		expect(result.current.hasActiveFilters).toBe(true);
	});

	it("keeps the default sort and its natural direction out of the URL", async () => {
		const { result, onUrlUpdate, lastUrl } = renderFilters(
			"?sort=verifiedAt&direction=ASC",
		);

		act(() => result.current.setSort({ column: "code", direction: "ASC" }));

		await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled());
		expect(lastUrl()?.has("sort")).toBe(false);
		expect(lastUrl()?.has("direction")).toBe(false);
	});

	it("flips the sorted column from the header", async () => {
		const { result, onUrlUpdate, lastUrl } =
			renderFilters("?sort=registeredAt");

		act(() => result.current.sortBy("registeredAt"));

		await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled());
		expect(lastUrl()?.get("sort")).toBe("registeredAt");
		expect(lastUrl()?.get("direction")).toBe("ASC");
	});

	it("clears the filters and keeps the sort", async () => {
		const { result, lastUrl } = renderFilters(
			"?status=DRAFT&search=quadro&sort=registeredAt",
		);

		act(() => result.current.clearFilters());

		await waitFor(() => expect(lastUrl()?.has("search")).toBe(false));
		expect(lastUrl()?.has("status")).toBe(false);
		expect(lastUrl()?.get("sort")).toBe("registeredAt");
	});
});
