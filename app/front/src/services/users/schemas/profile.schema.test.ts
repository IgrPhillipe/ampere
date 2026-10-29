import { describe, expect, it } from "vitest";

import { profileResponseSchema } from "./profile.schema";

describe("profileResponseSchema", () => {
	it("valida o schema de retorno do perfil", () => {
		const validProfile = {
			id: "1",
			name: "Ana Carolina Lima",
			email: "ana.lima@exemplo.com.br",
			role: "user",
			crea: "1684-D",
			creaState: "PE",
			company: "Lima Engenharia Elétrica",
			phone: "(81) 98821-4470",
		};

		const parsed = profileResponseSchema.parse(validProfile);
		expect(parsed.name).toBe("Ana Carolina Lima");
		expect(parsed.crea).toBe("1684-D");
		expect(parsed.creaState).toBe("PE");
	});

	it("aceita campos opcionais como nulos", () => {
		const minimalProfile = {
			id: "2",
			name: "Carlos Engenheiro",
			email: "carlos@exemplo.com",
			role: "user",
			crea: null,
			creaState: null,
			company: null,
			phone: null,
		};

		const parsed = profileResponseSchema.parse(minimalProfile);
		expect(parsed.name).toBe("Carlos Engenheiro");
		expect(parsed.crea).toBeNull();
	});
});
