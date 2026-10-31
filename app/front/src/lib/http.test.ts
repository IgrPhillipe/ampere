import { useAuthStore } from "@features/shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { isPasswordChangeRequired } from "./api-error";
import { http } from "./http";

const fetchMock = vi.fn(async () => Response.json({ data: {} }));

// Node does not resolve the relative "/api" prefix the browser uses.
const api = http.extend({ prefix: "http://localhost/api" });

const sentAuthorization = () => {
	const [request] = fetchMock.mock.lastCall as unknown as [Request];

	return request.headers.get("Authorization");
};

describe("http", () => {
	beforeEach(() => {
		vi.stubGlobal("fetch", fetchMock);
		useAuthStore.getState().login({
			id: "1",
			name: "Usuário Teste",
			email: "user@ampere.com",
			role: "user",
			mustChangePassword: false,
			token: "token-salvo",
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		useAuthStore.getState().logout();
	});

	it("sends the saved token to the API", async () => {
		await api.get("projects");

		expect(sentAuthorization()).toBe("Bearer token-salvo");
	});

	it("does not send a saved token to the login, which the server would refuse", async () => {
		await api.post("auth/login", {
			json: { email: "user@ampere.com", password: "senha@123" },
		});

		expect(sentAuthorization()).toBeNull();
	});

	it("marks the change as pending when the API refuses a temporary password", async () => {
		fetchMock.mockResolvedValueOnce(
			Response.json(
				{ status: 403, code: "PASSWORD_CHANGE_REQUIRED" },
				{ status: 403 },
			),
		);

		const error = await api.get("projects").catch((cause: unknown) => cause);

		expect(isPasswordChangeRequired(error)).toBe(true);
		expect(useAuthStore.getState().user?.mustChangePassword).toBe(true);
	});

	it("keeps the session as it is on any other refusal", async () => {
		fetchMock.mockResolvedValueOnce(
			Response.json({ status: 403 }, { status: 403 }),
		);

		const error = await api.get("users").catch((cause: unknown) => cause);

		expect(isPasswordChangeRequired(error)).toBe(false);

		expect(useAuthStore.getState().user?.mustChangePassword).toBe(false);
		expect(useAuthStore.getState().isAuthenticated).toBe(true);
	});
});
