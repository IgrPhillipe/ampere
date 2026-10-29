import { describe, expect, it } from "vitest";

import { changePasswordSchema, profileSchema, registerSchema } from "./index";

describe("auth schemas", () => {
	it("valida schema de cadastro válido", () => {
		const valid = {
			name: "Ana Carolina Lima",
			crea: "1684-D",
			creaState: "PE",
			email: "ana.lima@exemplo.com.br",
			company: "Lima Engenharia Elétrica",
			phone: "(81) 98821-4470",
			password: "Senha123",
			confirmPassword: "Senha123",
		};

		const result = registerSchema.safeParse(valid);
		expect(result.success).toBe(true);
	});

	it("rejeita cadastro com senhas divergentes", () => {
		const invalid = {
			name: "Ana Carolina Lima",
			crea: "1684-D",
			creaState: "PE",
			email: "ana.lima@exemplo.com.br",
			company: "Lima Engenharia Elétrica",
			phone: "(81) 98821-4470",
			password: "Senha123",
			confirmPassword: "OutraSenha123",
		};

		const result = registerSchema.safeParse(invalid);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.message).toBe("As senhas não conferem.");
		}
	});

	it("valida schema de edição de perfil", () => {
		const valid = {
			name: "Ana Carolina Lima",
			email: "ana.lima@exemplo.com.br",
			company: "Lima Engenharia Elétrica",
			phone: "(81) 98821-4470",
			crea: "1684-D",
			creaState: "PE",
		};

		const result = profileSchema.safeParse(valid);
		expect(result.success).toBe(true);
	});

	it("valida schema de troca de senha", () => {
		const valid = {
			currentPassword: "Senha123",
			newPassword: "NovaSenha456",
			confirmNewPassword: "NovaSenha456",
		};

		const result = changePasswordSchema.safeParse(valid);
		expect(result.success).toBe(true);
	});
});
