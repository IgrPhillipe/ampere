import { useAuthStore } from "@features/shared";
import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { LoginResponse } from "../../schemas";
import { useStartSession } from "./useStartSession";

const mockNavigate = vi.fn();

vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => mockNavigate,
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));

const sessionOf = (mustChangePassword: boolean): LoginResponse => ({
	token: "token",
	user: {
		id: "7",
		name: "Rita Analista",
		email: "rita@ampere.com",
		role: "reviewer",
		mustChangePassword,
	},
});

describe("useStartSession", () => {
	beforeEach(() => mockNavigate.mockReset());

	afterEach(() => useAuthStore.getState().logout());

	it("leva a senha temporária para a troca, guardando o destino", () => {
		const { result } = renderHook(() => useStartSession());

		result.current(sessionOf(true), "/tabelas-normativas");

		expect(mockNavigate).toHaveBeenCalledWith({
			to: "/trocar-senha",
			search: { redirect: "/tabelas-normativas" },
		});
		expect(useAuthStore.getState().user?.mustChangePassword).toBe(true);
	});

	it("abre a página inicial do papel quando a senha já foi trocada", () => {
		const { result } = renderHook(() => useStartSession());

		result.current(sessionOf(false));

		expect(mockNavigate).toHaveBeenCalledWith({ to: "/fila-de-analise" });
	});
});
