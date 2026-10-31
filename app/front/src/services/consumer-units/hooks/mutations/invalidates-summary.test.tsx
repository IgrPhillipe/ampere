import {
	createConsumerUnitGroup,
	deleteConsumerUnitGroup,
	updateConsumerUnitGroup,
} from "@services/consumer-units/requests";
import { projectKeys } from "@services/projects";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";

import { useCreateConsumerUnitGroup } from "./useCreateConsumerUnitGroup";
import { useDeleteConsumerUnitGroup } from "./useDeleteConsumerUnitGroup";
import { useUpdateConsumerUnitGroup } from "./useUpdateConsumerUnitGroup";

vi.mock("@services/consumer-units/requests", () => ({
	createConsumerUnitGroup: vi.fn(),
	deleteConsumerUnitGroup: vi.fn(),
	updateConsumerUnitGroup: vi.fn(),
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const summaryKey = projectKeys.detail("4");

const payload = { kind: "RESIDENTIAL", name: "Torre A", quantity: 10 } as const;

const setup = <T,>(useMutationHook: (projectId: string) => T) => {
	const queryClient = new QueryClient();
	queryClient.setQueryData(summaryKey, { id: "4" });

	const wrapper = ({ children }: PropsWithChildren) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);

	return {
		mutation: renderHook(() => useMutationHook("4"), { wrapper }).result,
		invalidated: () => queryClient.getQueryState(summaryKey)?.isInvalidated,
	};
};

describe("project summary freshness", () => {
	it("refreshes the project summary after a group is created", async () => {
		vi.mocked(createConsumerUnitGroup).mockResolvedValue({} as never);
		const { mutation, invalidated } = setup(useCreateConsumerUnitGroup);

		await act(() => mutation.current.mutateAsync({ projectId: "4", payload }));

		expect(invalidated()).toBe(true);
	});

	it("refreshes the project summary after a group is updated", async () => {
		vi.mocked(updateConsumerUnitGroup).mockResolvedValue({} as never);
		const { mutation, invalidated } = setup(useUpdateConsumerUnitGroup);

		await act(() =>
			mutation.current.mutateAsync({ projectId: "4", groupId: "7", payload }),
		);

		expect(invalidated()).toBe(true);
	});

	it("refreshes the project summary after a group is deleted", async () => {
		vi.mocked(deleteConsumerUnitGroup).mockResolvedValue();
		const { mutation, invalidated } = setup(useDeleteConsumerUnitGroup);

		await act(() =>
			mutation.current.mutateAsync({ projectId: "4", groupId: "7" }),
		);

		expect(invalidated()).toBe(true);
	});
});
