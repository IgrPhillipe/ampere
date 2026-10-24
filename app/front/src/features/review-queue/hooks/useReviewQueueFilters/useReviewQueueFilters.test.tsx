import { act, renderHook, waitFor } from "@testing-library/react";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { describe, expect, it, vi } from "vitest";

import { useReviewQueueFilters } from "./useReviewQueueFilters";

const renderFilters = (searchParams = "") => {
	const onUrlUpdate = vi.fn();
	const wrapper = withNuqsTestingAdapter({
		searchParams,
		hasMemory: true,
		onUrlUpdate,
	});
	const { result } = renderHook(() => useReviewQueueFilters(), { wrapper });
	const lastUrl = () => onUrlUpdate.mock.lastCall?.[0]?.searchParams;

	return { result, onUrlUpdate, lastUrl };
};

describe("useReviewQueueFilters", () => {
	it("converts invalid URL values to safe defaults", () => {
		const { result } = renderFilters(
			"?page=not-a-page&filter=INVALID&sort=INVALID&direction=UP&reviewer=x y",
		);

		expect(result.current.page).toBe(1);
		expect(result.current.filter).toBe("ALL");
		expect(result.current.sort).toEqual({
			column: "deadline",
			direction: "ASC",
		});
		expect(result.current.reviewer).toBeNull();
		expect(result.current.hasActiveFilters).toBe(false);
	});

	it("reads the old direction-only sort as the default sort", () => {
		const { result } = renderFilters("?sort=DESC");

		expect(result.current.sort).toEqual({
			column: "deadline",
			direction: "ASC",
		});
	});

	it("reads a sort column, its direction and the new filters from the URL", () => {
		const { result } = renderFilters(
			"?sort=demand&direction=ASC&reviewer=none&municipality=Recife,Olinda&state=PE",
		);

		expect(result.current.sort).toEqual({ column: "demand", direction: "ASC" });
		expect(result.current.reviewer).toBe("none");
		expect(result.current.municipality).toEqual(["Recife", "Olinda"]);
		expect(result.current.state).toEqual(["PE"]);
		expect(result.current.hasActiveFilters).toBe(true);
	});

	it("builds the API params from the URL", () => {
		const { result } = renderFilters(
			"?filter=REANALYSIS&sort=demand&reviewer=none&municipality=Recife",
		);

		expect(result.current.params).toEqual({
			page: 1,
			filter: "REANALYSIS",
			search: undefined,
			sort: "demand",
			direction: "DESC",
			reviewer: "none",
			municipality: ["Recife"],
		});
	});

	it("stores search in the URL and returns to the first page", async () => {
		const { result, lastUrl } = renderFilters("?page=3");

		act(() => result.current.setSearch("Recife"));

		await waitFor(() => {
			expect(lastUrl()?.get("search")).toBe("Recife");
			expect(lastUrl()?.has("page")).toBe(false);
		});
	});

	it("stores a filter in the URL and returns to the first page", async () => {
		const { result, onUrlUpdate, lastUrl } = renderFilters("?page=2");

		act(() => result.current.setFilter("REANALYSIS"));

		await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled());
		expect(lastUrl()?.get("filter")).toBe("REANALYSIS");
		expect(lastUrl()?.has("page")).toBe(false);
	});

	it("flips the direction when the sorted column is picked again", async () => {
		const { result, onUrlUpdate, lastUrl } = renderFilters("?page=4");

		act(() => result.current.sortBy("deadline"));

		await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled());
		expect(lastUrl()?.has("sort")).toBe(false);
		expect(lastUrl()?.get("direction")).toBe("DESC");
		expect(lastUrl()?.has("page")).toBe(false);
	});

	it("starts another column in its natural direction", async () => {
		const { result, onUrlUpdate, lastUrl } = renderFilters("?direction=DESC");

		act(() => result.current.sortBy("warnings"));

		await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled());
		expect(lastUrl()?.get("sort")).toBe("warnings");
		expect(lastUrl()?.has("direction")).toBe(false);
	});

	it("clears the filters and keeps the sort", async () => {
		const { result, lastUrl } = renderFilters(
			"?filter=DUE_SOON&search=Olinda&reviewer=2&municipality=Olinda%2FPE&sort=demand",
		);

		act(() => result.current.clearFilters());

		await waitFor(() => expect(lastUrl()?.toString()).toBe("sort=demand"));
	});
});
