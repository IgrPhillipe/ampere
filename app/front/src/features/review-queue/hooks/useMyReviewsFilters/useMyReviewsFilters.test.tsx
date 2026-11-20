import { act, renderHook, waitFor } from "@testing-library/react";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { describe, expect, it, vi } from "vitest";

import { useMyReviewsFilters } from "./useMyReviewsFilters";

const renderFilters = (searchParams = "") => {
	const onUrlUpdate = vi.fn();
	const wrapper = withNuqsTestingAdapter({
		searchParams,
		hasMemory: true,
		onUrlUpdate,
	});
	const { result } = renderHook(() => useMyReviewsFilters(), { wrapper });
	const lastUrl = () => onUrlUpdate.mock.lastCall?.[0]?.searchParams;

	return { result, lastUrl };
};

describe("useMyReviewsFilters", () => {
	it("falls back to every decision from an unknown value", () => {
		const { result } = renderFilters(
			"?decision=PENDING&decidedFrom=31/10/2026",
		);

		expect(result.current.decision).toBe("ALL");
		expect(result.current.period).toEqual({ from: null, to: null });
		expect(result.current.params.decision).toBeUndefined();
		expect(result.current.hasActiveFilters).toBe(false);
	});

	it("drops the end of an inverted period, which the API would refuse", () => {
		const { result } = renderFilters(
			"?decidedFrom=2026-11-10&decidedTo=2026-11-01",
		);

		expect(result.current.params).toMatchObject({
			decidedFrom: "2026-11-10",
			decidedTo: undefined,
		});
	});

	it("goes back to the first page when the decision changes", async () => {
		const { result, lastUrl } = renderFilters("?page=3");

		act(() => result.current.setDecision("REJECTED"));

		await waitFor(() => expect(lastUrl()?.get("decision")).toBe("REJECTED"));
		expect(lastUrl()?.has("page")).toBe(false);

		act(() => result.current.setDecision("ALL"));

		await waitFor(() => expect(lastUrl()?.has("decision")).toBe(false));
	});

	it("keeps only the municipalities of the states still chosen", async () => {
		const { result, lastUrl } = renderFilters(
			"?state=PE&state=AL&municipality=Recife&municipality=Maceió",
		);

		act(() => result.current.setState(["PE"]));

		await waitFor(() => expect(lastUrl()?.getAll("state")).toEqual(["PE"]));
		expect(lastUrl()?.getAll("municipality")).toEqual(["Recife"]);
	});

	it("clears every filter at once", async () => {
		const { result, lastUrl } = renderFilters(
			"?decision=APPROVED&search=Aurora&state=PE&decidedFrom=2026-11-01",
		);

		expect(result.current.hasActiveFilters).toBe(true);

		act(() => result.current.clearFilters());

		await waitFor(() => expect(lastUrl()?.toString()).toBe(""));
	});
});
