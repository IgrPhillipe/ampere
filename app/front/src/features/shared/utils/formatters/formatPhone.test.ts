import { describe, expect, it } from "vitest";

import { formatPhone } from "./formatPhone";

describe("formatPhone", () => {
	it("formata telefone celular com 11 dígitos", () => {
		expect(formatPhone("81988214470")).toBe("(81) 98821-4470");
	});

	it("formata telefone fixo com 10 dígitos", () => {
		expect(formatPhone("8134214470")).toBe("(81) 3421-4470");
	});

	it("lida com digitação progressiva", () => {
		expect(formatPhone("81")).toBe("(81");
		expect(formatPhone("819")).toBe("(81) 9");
		expect(formatPhone("8198821")).toBe("(81) 9882-1");
	});
});
