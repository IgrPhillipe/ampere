import { z } from "zod";

export const brazilianStateSchema = z.enum([
	"AC",
	"AL",
	"AM",
	"AP",
	"BA",
	"CE",
	"DF",
	"ES",
	"GO",
	"MA",
	"MG",
	"MS",
	"MT",
	"PA",
	"PB",
	"PE",
	"PI",
	"PR",
	"RJ",
	"RN",
	"RO",
	"RR",
	"RS",
	"SC",
	"SE",
	"SP",
	"TO",
]);

export type BrazilianState = z.infer<typeof brazilianStateSchema>;

export const stateSchema = z.object({
	sigla: brazilianStateSchema,
	nome: z.string(),
});

export type State = z.infer<typeof stateSchema>;

export const stateListSchema = z.array(stateSchema);

export const municipalitySchema = z.object({
	id: z.number(),
	nome: z.string(),
});

export const municipalityListSchema = z.array(municipalitySchema);

/** ViaCEP answers 200 with `{ "erro": "true" }` for a CEP it does not know. */
export const postalCodeAddressSchema = z.union([
	z.object({ erro: z.union([z.literal(true), z.literal("true")]) }),
	z.object({
		cep: z.string(),
		logradouro: z.string(),
		bairro: z.string(),
		localidade: z.string(),
		uf: brazilianStateSchema,
	}),
]);

export type PostalCodeAddress = Extract<
	z.infer<typeof postalCodeAddressSchema>,
	{ cep: string }
>;
