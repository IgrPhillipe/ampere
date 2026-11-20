import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { httpErrorOf } from "@/test/fixtures/http-error";

import { exportReviewQueueCsv } from "../../requests";
import { useExportReviewQueueCsv } from "./useExportReviewQueueCsv";

vi.mock("../../requests", () => ({ exportReviewQueueCsv: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const wrapper = ({ children }: PropsWithChildren) => (
	<QueryClientProvider
		client={
			new QueryClient({ defaultOptions: { mutations: { retry: false } } })
		}
	>
		{children}
	</QueryClientProvider>
);

const run = async () => {
	const { result } = renderHook(() => useExportReviewQueueCsv(), { wrapper });
	act(() => result.current.mutate({ filter: "DUE_SOON" as const }));
	await waitFor(() => expect(result.current.isIdle).toBe(false));
	await waitFor(() => expect(result.current.isPending).toBe(false));

	return result;
};

describe("useExportReviewQueueCsv", () => {
	beforeEach(() => vi.clearAllMocks());

	it("hands the exported file to the caller", async () => {
		const file = {
			blob: new Blob(["x"]),
			filename: "fila-analise-2026-11-20.csv",
		};
		vi.mocked(exportReviewQueueCsv).mockResolvedValue(file);

		const result = await run();

		expect(exportReviewQueueCsv).toHaveBeenCalledWith(
			{ filter: "DUE_SOON" as const },
			expect.anything(),
		);
		expect(result.current.data).toBe(file);
		expect(toast.error).not.toHaveBeenCalled();
	});

	it("shows the reason the API gives", async () => {
		vi.mocked(exportReviewQueueCsv).mockRejectedValue(
			await httpErrorOf(403, {
				status: 403,
				detail: "Apenas analista e administrador acessam a fila.",
			}),
		);

		await run();

		expect(toast.error).toHaveBeenCalledWith(
			"Apenas analista e administrador acessam a fila.",
		);
	});

	it("falls back to a generic message when the API says nothing useful", async () => {
		vi.mocked(exportReviewQueueCsv).mockRejectedValue(
			await httpErrorOf(409, { status: 409 }),
		);

		await run();

		expect(toast.error).toHaveBeenCalledWith(
			"Não foi possível exportar a fila de análise.",
		);
	});
});
