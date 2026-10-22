import { act, renderHook, waitFor } from "@testing-library/react";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { describe, expect, it, vi } from "vitest";

import { useProjectFilters } from "./useProjectFilters";

const renderFilters = (searchParams = "") => {
	const onUrlUpdate = vi.fn();
	const wrapper = withNuqsTestingAdapter({
		searchParams,
		hasMemory: true,
		onUrlUpdate,
	});
	const { result } = renderHook(() => useProjectFilters(), { wrapper });
	const lastUrl = () => onUrlUpdate.mock.lastCall?.[0]?.searchParams;

	return { result, onUrlUpdate, lastUrl };
};

describe("useProjectFilters", () => {
	it("defaults to the latest update first", () => {
		const { result } = renderFilters("?sort=ASC");

		expect(result.current.sort).toEqual({
			column: "updatedAt",
			direction: "DESC",
		});
		expect(result.current.hasActiveFilters).toBe(false);
	});

	it("ignores invalid dates and an inverted period", () => {
		expect(
			renderFilters("?createdFrom=31/08/2026").result.current.createdFrom,
		).toBeNull();

		const { result } = renderFilters(
			"?createdFrom=2026-09-01&createdTo=2026-08-01",
		);

		expect(result.current.createdFrom).toBe("2026-09-01");
		expect(result.current.createdTo).toBeNull();
	});

	it("drops the end of the period when the new start passes it", async () => {
		const { result, onUrlUpdate, lastUrl } = renderFilters(
			"?createdTo=2026-08-01&page=2",
		);

		act(() => result.current.setCreatedFrom("2026-08-15"));

		await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled());
		expect(lastUrl()?.get("createdFrom")).toBe("2026-08-15");
		expect(lastUrl()?.has("createdTo")).toBe(false);
		expect(lastUrl()?.has("page")).toBe(false);
	});

	it("stores the blocking filter only when it is on", async () => {
		const { result, onUrlUpdate, lastUrl } = renderFilters();

		act(() => result.current.setHasBlocking(true));

		await waitFor(() => expect(lastUrl()?.get("hasBlocking")).toBe("true"));

		act(() => result.current.setHasBlocking(false));

		await waitFor(() => expect(onUrlUpdate).toHaveBeenCalledTimes(2));
		expect(lastUrl()?.has("hasBlocking")).toBe(false);
	});

	it("sorts by name ascending first, then flips", async () => {
		const { result, onUrlUpdate, lastUrl } = renderFilters();

		act(() => result.current.sortBy("name"));

		await waitFor(() => expect(lastUrl()?.get("sort")).toBe("name"));
		expect(lastUrl()?.has("direction")).toBe(false);
		expect(result.current.sort).toEqual({ column: "name", direction: "ASC" });

		act(() => result.current.sortBy("name"));

		await waitFor(() => expect(onUrlUpdate).toHaveBeenCalledTimes(2));
		expect(lastUrl()?.get("direction")).toBe("DESC");
	});

	it("clears every filter and keeps the sort", async () => {
		const { result, lastUrl } = renderFilters(
			"?status=REJECTED&search=Aurora&municipality=Recife%2FPE&createdFrom=2026-08-01&hasBlocking=true&sort=name",
		);

		expect(result.current.hasActiveFilters).toBe(true);

		act(() => result.current.clearFilters());

		await waitFor(() => expect(lastUrl()?.toString()).toBe("sort=name"));
	});
});
