import { act, renderHook, waitFor } from "@testing-library/react";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { describe, expect, it, vi } from "vitest";

import { useReviewQueueFilters } from "./useReviewQueueFilters";

describe("useReviewQueueFilters", () => {
	it("converts invalid URL values to safe defaults", () => {
		const wrapper = withNuqsTestingAdapter({
			searchParams: "?page=not-a-page&filter=INVALID&sort=INVALID",
		});
		const { result } = renderHook(() => useReviewQueueFilters(), { wrapper });

		expect(result.current.page).toBe(1);
		expect(result.current.filter).toBe("ALL");
		expect(result.current.sort).toBe("DEADLINE_ASC");
	});

	it("stores search in the URL and returns to the first page", async () => {
		const onUrlUpdate = vi.fn();
		const wrapper = withNuqsTestingAdapter({
			searchParams: "?page=3",
			hasMemory: true,
			onUrlUpdate,
		});
		const { result } = renderHook(() => useReviewQueueFilters(), { wrapper });

		act(() => result.current.setSearch("Recife"));

		await waitFor(() => {
			const lastUpdate = onUrlUpdate.mock.lastCall?.[0];
			expect(lastUpdate?.searchParams.get("search")).toBe("Recife");
			expect(lastUpdate?.searchParams.has("page")).toBe(false);
		});
	});

	it("stores a filter in the URL and returns to the first page", async () => {
		const onUrlUpdate = vi.fn();
		const wrapper = withNuqsTestingAdapter({
			searchParams: "?page=2",
			hasMemory: true,
			onUrlUpdate,
		});
		const { result } = renderHook(() => useReviewQueueFilters(), { wrapper });

		act(() => result.current.setFilter("REANALYSIS"));

		await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled());
		const lastUpdate = onUrlUpdate.mock.lastCall?.[0];

		expect(lastUpdate?.searchParams.get("filter")).toBe("REANALYSIS");
		expect(lastUpdate?.searchParams.has("page")).toBe(false);
	});

	it("stores deadline sorting in the URL and returns to the first page", async () => {
		const onUrlUpdate = vi.fn();
		const wrapper = withNuqsTestingAdapter({
			searchParams: "?page=4",
			hasMemory: true,
			onUrlUpdate,
		});
		const { result } = renderHook(() => useReviewQueueFilters(), { wrapper });

		act(() => result.current.setSort("DEADLINE_DESC"));

		await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled());
		const lastUpdate = onUrlUpdate.mock.lastCall?.[0];

		expect(lastUpdate?.searchParams.get("sort")).toBe("DEADLINE_DESC");
		expect(lastUpdate?.searchParams.has("page")).toBe(false);
	});
});
