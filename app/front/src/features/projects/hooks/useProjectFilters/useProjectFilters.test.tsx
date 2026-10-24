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
			renderFilters("?createdFrom=31/08/2026").result.current.period,
		).toEqual({ from: null, to: null });

		const { result } = renderFilters(
			"?createdFrom=2026-09-01&createdTo=2026-08-01",
		);

		expect(result.current.period).toEqual({ from: "2026-09-01", to: null });
	});

	it("stores the period and returns to the first page", async () => {
		const { result, onUrlUpdate, lastUrl } = renderFilters("?page=2");

		act(() =>
			result.current.setPeriod({ from: "2026-08-01", to: "2026-08-31" }),
		);

		await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled());
		expect(lastUrl()?.get("createdFrom")).toBe("2026-08-01");
		expect(lastUrl()?.get("createdTo")).toBe("2026-08-31");
		expect(lastUrl()?.has("page")).toBe(false);
	});

	it("builds the API params from the URL", () => {
		const { result } = renderFilters(
			"?sort=name&municipality=Recife&municipality=Olinda&createdTo=2026-08-31&findings=BLOCKING_OPEN&page=3",
		);

		expect(result.current.params).toEqual({
			page: 3,
			status: undefined,
			search: undefined,
			sort: "name",
			direction: "ASC",
			municipality: ["Recife", "Olinda"],
			createdFrom: undefined,
			createdTo: "2026-08-31",
			findings: ["BLOCKING_OPEN"],
		});
	});

	it("keeps only the municipalities of the states still chosen", async () => {
		const { result, lastUrl } = renderFilters(
			"?state=PE&state=PB&municipality=Recife&municipality=Pedras%20de%20Fogo&page=2",
		);

		act(() => result.current.setState(["PB"]));

		await waitFor(() =>
			expect(lastUrl()?.toString()).toBe(
				"state=PB&municipality=Pedras+de+Fogo",
			),
		);
	});

	it("repeats the parameter for each state", async () => {
		const { result, lastUrl } = renderFilters();

		act(() => result.current.setState(["PE", "PB"]));

		await waitFor(() =>
			expect(lastUrl()?.getAll("state")).toEqual(["PE", "PB"]),
		);
	});

	it("stores several findings and ignores unknown values", async () => {
		expect(
			renderFilters("?findings=OPEN&findings=NONE_OPEN").result.current
				.findings,
		).toEqual(["NONE_OPEN"]);

		const { result, onUrlUpdate, lastUrl } = renderFilters();

		act(() => result.current.setFindings(["NONE_OPEN", "BLOCKING_OPEN"]));

		await waitFor(() =>
			expect(lastUrl()?.getAll("findings")).toEqual([
				"NONE_OPEN",
				"BLOCKING_OPEN",
			]),
		);

		act(() => result.current.setFindings([]));

		await waitFor(() => expect(onUrlUpdate).toHaveBeenCalledTimes(2));
		expect(lastUrl()?.has("findings")).toBe(false);
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
			"?status=REJECTED&search=Aurora&municipality=Recife%2FPE&createdFrom=2026-08-01&findings=ANY_OPEN&sort=name",
		);

		expect(result.current.hasActiveFilters).toBe(true);

		act(() => result.current.clearFilters());

		await waitFor(() => expect(lastUrl()?.toString()).toBe("sort=name"));
	});
});
