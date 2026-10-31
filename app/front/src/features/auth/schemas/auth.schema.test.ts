import { describe, expect, it } from "vitest";

import {
	changePasswordSchema,
	designerProfileSchema,
	profileSchema,
	registerSchema,
} from "./index";

const profile = {
	name: "Ana Carolina Lima",
	email: "ana.lima@exemplo.com.br",
	company: "Lima Engenharia Elétrica",
	phone: "(81) 98821-4470",
	crea: "1684D",
	creaState: "pe",
};

const messagesOf = (result: { error?: { issues: { message: string }[] } }) =>
	result.error?.issues.map((issue) => issue.message) ?? [];

describe("profileSchema", () => {
	it("aceita analista e administrador sem CREA", () => {
		expect(
			profileSchema.safeParse({ ...profile, crea: "", creaState: "" }).success,
		).toBe(true);
	});

	it("exige o telefone", () => {
		expect(profileSchema.safeParse({ ...profile, phone: " " }).success).toBe(
			false,
		);
	});
});

describe("designerProfileSchema", () => {
	it("aceita o perfil e devolve a UF em maiúsculas", () => {
		const result = designerProfileSchema.parse(profile);

		expect(result.creaState).toBe("PE");
	});

	it.each([
		"1684-D",
		"1684D/PE",
		"123",
	])("recusa o CREA %s, que a API não aceita", (crea) => {
		const result = designerProfileSchema.safeParse({ ...profile, crea });

		expect(messagesOf(result)).toContain(
			"Informe só o número do CREA, sem a UF e sem hífen.",
		);
	});

	it("exige o CREA do projetista", () => {
		const result = designerProfileSchema.safeParse({ ...profile, crea: "" });

		expect(messagesOf(result)).toContain("O número do CREA é obrigatório.");
	});
});

describe("registerSchema", () => {
	const registration = {
		...profile,
		password: "Senha123",
		confirmPassword: "Senha123",
	};

	it("aceita o cadastro válido", () => {
		expect(registerSchema.safeParse(registration).success).toBe(true);
	});

	it("recusa senhas divergentes", () => {
		const result = registerSchema.safeParse({
			...registration,
			confirmPassword: "OutraSenha123",
		});

		expect(messagesOf(result)).toEqual(["As senhas não conferem."]);
	});

	it.each([
		"Senha12",
		"somenteletras",
		"12345678",
	])("recusa a senha %s, fora da política", (password) => {
		const result = registerSchema.safeParse({
			...registration,
			password,
			confirmPassword: password,
		});

		expect(messagesOf(result)).toContain(
			"A senha deve ter ao menos 8 caracteres, com letra e número.",
		);
	});
});

describe("changePasswordSchema", () => {
	it("aceita a troca de senha", () => {
		const result = changePasswordSchema.safeParse({
			currentPassword: "Senha123",
			newPassword: "NovaSenha456",
			confirmNewPassword: "NovaSenha456",
		});

		expect(result.success).toBe(true);
	});
});
