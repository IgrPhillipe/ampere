import { describe, expect, it } from "vitest";

import { profileResponseSchema } from "./profile.schema";

const profile = {
	id: "1",
	name: "Ana Carolina Lima",
	email: "ana.lima@exemplo.com.br",
	role: "user",
	crea: "1684D",
	creaState: "PE",
	company: null,
	phone: null,
};

describe("profileResponseSchema", () => {
	it("aceita o perfil como a API devolve", () => {
		expect(profileResponseSchema.parse(profile)).toEqual(profile);
	});

	it("recusa papel fora do contrato", () => {
		expect(
			profileResponseSchema.safeParse({ ...profile, role: "USER" }).success,
		).toBe(false);
	});
});
