import { externalHttp } from "@lib/http";
import { describe, expect, it, vi } from "vitest";

import { getPostalCodeAddress } from "./requests";

vi.mock("@lib/http", () => ({ externalHttp: { get: vi.fn() } }));

const respond = (body: unknown) =>
	vi
		.mocked(externalHttp.get)
		.mockReturnValue({ json: () => Promise.resolve(body) } as never);

describe("locations requests", () => {
	it("reads the address of a known CEP", async () => {
		respond({
			cep: "50030-230",
			logradouro: "Cais do Apolo",
			bairro: "Recife",
			localidade: "Recife",
			uf: "PE",
			ibge: "2611606",
		});

		await expect(getPostalCodeAddress("50030230")).resolves.toMatchObject({
			localidade: "Recife",
			uf: "PE",
		});
	});

	it("returns null for a CEP ViaCEP does not know", async () => {
		respond({ erro: "true" });

		await expect(getPostalCodeAddress("00000000")).resolves.toBeNull();
	});
});
