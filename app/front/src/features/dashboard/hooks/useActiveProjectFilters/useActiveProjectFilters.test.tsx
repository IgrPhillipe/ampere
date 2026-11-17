import { act, renderHook, waitFor } from "@testing-library/react";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { describe, expect, it, vi } from "vitest";

import { ACTIVE_PROJECT_STATUSES } from "../../constants";
import { useActiveProjectFilters } from "./useActiveProjectFilters";

const renderFilters = (searchParams = "") => {
	const onUrlUpdate = vi.fn();
	const wrapper = withNuqsTestingAdapter({
		searchParams,
		hasMemory: true,
		onUrlUpdate,
	});
	const { result } = renderHook(() => useActiveProjectFilters(), { wrapper });
	const lastUrl = () => onUrlUpdate.mock.lastCall?.[0]?.searchParams;

	return { result, lastUrl };
};

describe("useActiveProjectFilters", () => {
	it("lists only active projects, newest update first", () => {
		const { result } = renderFilters();

		expect(result.current.params).toEqual({
			status: ACTIVE_PROJECT_STATUSES,
			sort: "updatedAt",
			direction: "DESC",
			page: 1,
		});
		expect(result.current.hasActiveFilters).toBe(false);
	});

	it("reads the designer and the page from the URL", () => {
		const { result } = renderFilters("?owner=5&page=2");

		expect(result.current.params).toMatchObject({ owner: "5", page: 2 });
		expect(result.current.hasActiveFilters).toBe(true);
	});

	it("keeps the natural direction of a column out of the URL", async () => {
		const { result, lastUrl } = renderFilters("?page=3");

		act(() => result.current.sortBy("name"));

		await waitFor(() => expect(lastUrl()?.toString()).toBe("sort=name"));
	});

	it("goes back to the first page when the designer changes", async () => {
		const { result, lastUrl } = renderFilters("?page=3");

		act(() => result.current.setOwner("7"));

		await waitFor(() => expect(lastUrl()?.toString()).toBe("owner=7"));
	});
});
