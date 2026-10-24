import { CONCESSION_MUNICIPALITIES } from "./concession-municipalities";
import type { BrazilianState } from "./schemas";

export const CONCESSION_STATES = [
	"PE",
	"PB",
] as const satisfies readonly BrazilianState[];

export type ConcessionState = (typeof CONCESSION_STATES)[number];

export const concessionStateNames: Record<ConcessionState, string> = {
	PE: "Pernambuco",
	PB: "Paraíba",
};

export const OUTSIDE_CONCESSION_MESSAGE =
	"Fora da área atendida pela Neoenergia Pernambuco: Pernambuco ou Pedras de Fogo (PB).";

export const POSTAL_CODE_STATE_MESSAGE = "O CEP não pertence à UF informada.";

// Correios ranges: Pernambuco is 50000-000 to 56999-999; Pedras de Fogo is 58328-xxx.
const POSTAL_CODE_RANGES: Record<ConcessionState, readonly [number, number]> = {
	PE: [50_000_000, 56_999_999],
	PB: [58_328_000, 58_328_999],
};

const fold = (value: string) =>
	value
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.trim()
		.toLowerCase();

export const isConcessionState = (state: string): state is ConcessionState =>
	(CONCESSION_STATES as readonly string[]).includes(state);

/** The state whose range holds the CEP, or `undefined` outside the concession area. */
export const concessionStateOfPostalCode = (digits: string) => {
	if (!/^\d{8}$/.test(digits)) return undefined;

	const value = Number(digits);

	return CONCESSION_STATES.find((state) => {
		const [from, to] = POSTAL_CODE_RANGES[state];
		return value >= from && value <= to;
	});
};

/** Served municipality names of the given states, or of the whole area when none is given. */
export const concessionMunicipalityNames = (
	states: readonly ConcessionState[] = [],
) =>
	CONCESSION_MUNICIPALITIES.filter(
		({ state }) => states.length === 0 || states.includes(state),
	)
		.map(({ name }) => name)
		.sort((a, b) => a.localeCompare(b, "pt-BR"));

/** The IBGE spelling of a served municipality, ignoring case and accents. */
export const concessionMunicipalityOf = (state: string, municipality: string) =>
	CONCESSION_MUNICIPALITIES.find(
		(item) => item.state === state && fold(item.name) === fold(municipality),
	)?.name;

export const concessionMunicipalityByCode = (code: string) =>
	CONCESSION_MUNICIPALITIES.find((item) => item.code === code);
