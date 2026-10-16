import { useAuthStore } from "@features/shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
});
