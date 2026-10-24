import { describe, expect, it } from "vitest";

import {
	concessionMunicipalityByCode,
	concessionMunicipalityNames,
	concessionMunicipalityOf,
	concessionStateOfPostalCode,
} from "./concession";

describe("concession area", () => {
	it("lists every served municipality, or those of the chosen states", () => {
		expect(concessionMunicipalityNames()).toHaveLength(186);
		expect(concessionMunicipalityNames(["PB"])).toEqual(["Pedras de Fogo"]);
	});

	it("returns the IBGE spelling ignoring case and accents", () => {
		expect(concessionMunicipalityOf("PE", "jaboatao dos guararapes")).toBe(
			"Jaboatão dos Guararapes",
		);
		expect(concessionMunicipalityOf("PB", "João Pessoa")).toBeUndefined();
	});

	it("maps the ViaCEP IBGE code to the canonical name", () => {
		expect(concessionMunicipalityByCode("2608503")?.name).toBe(
			"Lagoa de Itaenga",
		);
	});

	it("finds the state of a CEP inside the area", () => {
		expect(concessionStateOfPostalCode("50030230")).toBe("PE");
		expect(concessionStateOfPostalCode("58328000")).toBe("PB");
		expect(concessionStateOfPostalCode("58039000")).toBeUndefined();
		expect(concessionStateOfPostalCode("01310100")).toBeUndefined();
	});
});
