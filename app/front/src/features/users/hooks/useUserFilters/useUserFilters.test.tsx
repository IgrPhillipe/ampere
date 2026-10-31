import { act, renderHook, waitFor } from "@testing-library/react";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { describe, expect, it, vi } from "vitest";

import { USERS_PAGE_SIZE, useUserFilters } from "./useUserFilters";

const renderFilters = (searchParams = "") => {
	const onUrlUpdate = vi.fn();
	const wrapper = withNuqsTestingAdapter({
		searchParams,
		hasMemory: true,
		onUrlUpdate,
	});
	const { result } = renderHook(() => useUserFilters(), { wrapper });
	const lastUrl = () => onUrlUpdate.mock.lastCall?.[0]?.searchParams;

	return { result, onUrlUpdate, lastUrl };
};

describe("useUserFilters", () => {
	it("lists every account on the first page by default", () => {
		const { result } = renderFilters("?role=owner&status=blocked");

		expect(result.current.hasActiveFilters).toBe(false);
		expect(result.current.params).toEqual({
			page: 1,
			pageSize: USERS_PAGE_SIZE,
		});
	});

	it("builds the API params from the URL", () => {
		const { result } = renderFilters("?role=reviewer&status=inactive&page=2");

		expect(result.current.params).toEqual({
			role: "reviewer",
			active: false,
			page: 2,
			pageSize: USERS_PAGE_SIZE,
		});
		expect(result.current.hasActiveFilters).toBe(true);
	});

	it("goes back to the first page when a filter changes", async () => {
		const { result, onUrlUpdate, lastUrl } = renderFilters("?page=3");

		act(() => result.current.setStatus("active"));

		await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled());
		expect(lastUrl()?.get("status")).toBe("active");
		expect(lastUrl()?.has("page")).toBe(false);
	});

	it("clears search, role and status together", async () => {
		const { result, lastUrl } = renderFilters(
			"?search=ana&role=user&status=active",
		);

		act(() => result.current.clearFilters());

		// The search leaves the URL after its debounce.
		await waitFor(() => expect(lastUrl()?.toString()).toBe(""));
	});
});
