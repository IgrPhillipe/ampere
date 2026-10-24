import { describe, expect, it } from "vitest";

import { concessionMunicipalities, coversAddress } from "./concession-area";

describe("concession area", () => {
	it("covers Pernambuco whole and Paraíba only in Pedras de Fogo", () => {
		expect(coversAddress("PE", "Petrolina")).toBe(true);
		expect(coversAddress("PB", "pedras de fogo")).toBe(true);
		expect(coversAddress("PB", "João Pessoa")).toBe(false);
		expect(coversAddress("SP", "São Paulo")).toBe(false);
	});

	it("narrows the Paraíba municipalities to the served one", () => {
		expect(
			concessionMunicipalities("PB", ["João Pessoa", "Pedras de Fogo"]),
		).toEqual(["Pedras de Fogo"]);
		expect(concessionMunicipalities("PE", ["Olinda", "Recife"])).toEqual([
			"Olinda",
			"Recife",
		]);
	});
});
