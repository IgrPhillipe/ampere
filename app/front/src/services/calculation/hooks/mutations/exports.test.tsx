import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { httpErrorOf } from "@/test/fixtures/http-error";

import { exportCalculationSpreadsheet } from "../../requests";
import { useExportCalculationSpreadsheet } from "./useExportCalculationSpreadsheet";

vi.mock("../../requests", () => ({ exportCalculationSpreadsheet: vi.fn() }));
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
	const { result } = renderHook(() => useExportCalculationSpreadsheet(), {
		wrapper,
	});
	act(() => result.current.mutate("14"));
	await waitFor(() => expect(result.current.isIdle).toBe(false));
	await waitFor(() => expect(result.current.isPending).toBe(false));

	return result;
};

describe("useExportCalculationSpreadsheet", () => {
	beforeEach(() => vi.clearAllMocks());

	it("hands the exported file to the caller", async () => {
		const file = { blob: new Blob(["x"]), filename: "2026-1008-calculo.xlsx" };
		vi.mocked(exportCalculationSpreadsheet).mockResolvedValue(file);

		const result = await run();

		expect(exportCalculationSpreadsheet).toHaveBeenCalledWith(
			"14",
			expect.anything(),
		);
		expect(result.current.data).toBe(file);
		expect(toast.error).not.toHaveBeenCalled();
	});

	it("shows the reason the API gives", async () => {
		vi.mocked(exportCalculationSpreadsheet).mockRejectedValue(
			await httpErrorOf(403, {
				status: 403,
				detail: "Você não tem acesso a este projeto.",
			}),
		);

		await run();

		expect(toast.error).toHaveBeenCalledWith(
			"Você não tem acesso a este projeto.",
		);
	});

	it("falls back to a generic message when the API says nothing useful", async () => {
		vi.mocked(exportCalculationSpreadsheet).mockRejectedValue(
			await httpErrorOf(409, { status: 409 }),
		);

		await run();

		expect(toast.error).toHaveBeenCalledWith(
			"Não foi possível exportar a planilha do cálculo.",
		);
	});
});
