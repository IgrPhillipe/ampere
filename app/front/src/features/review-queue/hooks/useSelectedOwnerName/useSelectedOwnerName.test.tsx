import type { ReviewQueueItem } from "@services/review-queue";
import { reviewQueueKeys } from "@services/review-queue";
import { getQueueOwnerList } from "@services/review-queue/requests";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useSelectedOwnerName } from "./useSelectedOwnerName";

vi.mock("@services/review-queue/requests", () => ({
	getQueueOwnerList: vi.fn(),
}));

const rows = [{ ownerName: "Carla Projetista" }] as ReviewQueueItem[];

const renderName = (
	owner: string | null,
	items: ReviewQueueItem[],
	cached?: boolean,
) => {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});

	if (cached) {
		queryClient.setQueryData(reviewQueueKeys.ownerList({ search: "" }), {
			pages: [
				{
					data: [{ id: "5", name: "Beto Projetista" }],
					pagination: { total: 1, page: 1, pageSize: 20 },
				},
			],
			pageParams: [1],
		});
	}

	const wrapper = ({ children }: PropsWithChildren) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);

	return renderHook(() => useSelectedOwnerName(owner, items), { wrapper })
		.result.current;
};

describe("useSelectedOwnerName (review queue)", () => {
	beforeEach(() => {
		vi.mocked(getQueueOwnerList).mockReturnValue(new Promise(vi.fn()));
	});

	it("has no name without a designer filter", () => {
		expect(renderName(null, rows, true)).toBeUndefined();
	});

	it("prefers the loaded owners", () => {
		expect(renderName("5", rows, true)).toBe("Beto Projetista");
	});

	it("falls back to the listed rows", () => {
		expect(renderName("9", rows, true)).toBe("Carla Projetista");
	});

	it("falls back to a neutral label", () => {
		expect(renderName("9", [])).toBe("Projetista selecionado");
	});
});
