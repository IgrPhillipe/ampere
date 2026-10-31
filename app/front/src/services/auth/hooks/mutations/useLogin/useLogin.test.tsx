import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";

import { httpErrorOf } from "@/test/fixtures/http-error";

import { login } from "../../../requests";
import { useLogin } from "./useLogin";

vi.mock("../../../requests", () => ({ login: vi.fn() }));

vi.mock("../../useStartSession", () => ({ useStartSession: () => vi.fn() }));

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const wrapper = ({ children }: PropsWithChildren) => (
	<QueryClientProvider client={new QueryClient()}>
		{children}
	</QueryClientProvider>
);

describe("useLogin", () => {
	it("mostra a mensagem da API para a conta desativada", async () => {
		vi.mocked(login).mockRejectedValue(
			await httpErrorOf(403, {
				detail: "Conta desativada. Procure a Neoenergia.",
			}),
		);

		const { result } = renderHook(() => useLogin(), { wrapper });

		act(() =>
			result.current.mutate({ email: "ex@ampere.com", password: "Senha123" }),
		);

		await waitFor(() =>
			expect(toast.error).toHaveBeenCalledWith(
				"Conta desativada. Procure a Neoenergia.",
			),
		);
	});
});
