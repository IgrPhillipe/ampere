import { type Project, projectKeys } from "@services/projects";
import { getProjectOwnerList } from "@services/projects/requests";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useSelectedOwnerName } from "./useSelectedOwnerName";

vi.mock("@services/projects/requests", () => ({
	getProjectOwnerList: vi.fn(),
}));

const rows = [
	{ ownerId: "9", ownerName: "Carla Projetista" },
	{ ownerId: "8", ownerName: "Davi Projetista" },
] as Project[];

const renderName = (
	owner: string | null,
	projects: Project[],
	cached?: boolean,
) => {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});

	if (cached) {
		queryClient.setQueryData(projectKeys.ownerList({ search: "" }), {
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

	return renderHook(() => useSelectedOwnerName(owner, projects), { wrapper })
		.result.current;
};

describe("useSelectedOwnerName (projects)", () => {
	beforeEach(() => {
		vi.mocked(getProjectOwnerList).mockReturnValue(new Promise(vi.fn()));
	});

	it("has no name without a designer filter", () => {
		expect(renderName(null, rows, true)).toBeUndefined();
	});

	it("prefers the loaded owners", () => {
		expect(renderName("5", rows, true)).toBe("Beto Projetista");
	});

	it("falls back to the row of the same designer", () => {
		expect(renderName("8", rows, true)).toBe("Davi Projetista");
	});

	it("falls back to a neutral label", () => {
		expect(renderName("7", [])).toBe("Projetista selecionado");
	});
});
