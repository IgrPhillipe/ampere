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

/** Pernambuco is served whole; Paraíba only in Pedras de Fogo. */
export const LIMITED_MUNICIPALITIES: Partial<
	Record<ConcessionState, readonly string[]>
> = { PB: ["Pedras de Fogo"] };

export const OUTSIDE_CONCESSION_MESSAGE =
	"Fora da área atendida pela Neoenergia Pernambuco: Pernambuco ou Pedras de Fogo (PB).";

const fold = (value: string) =>
	value
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.trim()
		.toLowerCase();

export const isConcessionState = (state: string): state is ConcessionState =>
	(CONCESSION_STATES as readonly string[]).includes(state);

export const concessionMunicipalities = (
	state: ConcessionState,
	municipalities: readonly string[],
) => {
	const limited = LIMITED_MUNICIPALITIES[state]?.map(fold);

	return limited
		? municipalities.filter((name) => limited.includes(fold(name)))
		: municipalities;
};

export const coversAddress = (state: string, municipality: string) =>
	isConcessionState(state) &&
	concessionMunicipalities(state, [municipality]).length === 1;
