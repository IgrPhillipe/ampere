import {
	CONCESSION_MUNICIPALITIES,
	type ConcessionMunicipality,
} from "@services/locations";
import type {
	ReviewerDistribution,
	ReviewerMunicipality,
} from "@services/reviewer-distribution";

export interface MunicipalityOwner {
	id: string;
	name: string;
}

/** The key of a municipality: names repeat across states in Brazil. */
export const municipalityKey = ({
	state,
	municipality,
}: ReviewerMunicipality) => `${state}/${municipality}`;

const concessionKey = ({ state, name }: ConcessionMunicipality) =>
	municipalityKey({ state, municipality: name });

/** Who holds each municipality: one analyst at most. */
export const getMunicipalityOwners = (distribution: ReviewerDistribution[]) =>
	new Map<string, MunicipalityOwner>(
		distribution.flatMap(({ reviewer, municipalities }) =>
			municipalities.map(
				(place) => [municipalityKey(place), reviewer] as const,
			),
		),
	);

/** Concession municipalities nobody holds: their projects wait as "Não Atribuído". */
export const getUnassignedMunicipalities = (
	distribution: ReviewerDistribution[],
) => {
	const owners = getMunicipalityOwners(distribution);

	return CONCESSION_MUNICIPALITIES.filter(
		(item) => !owners.has(concessionKey(item)),
	);
};

export interface MunicipalityOption {
	key: string;
	place: ReviewerMunicipality;
	label: string;
	/** Another analyst holds it, so this one cannot take it. */
	heldBy?: string;
}

/** Every concession municipality, marking those held by someone else. */
export const getMunicipalityOptions = (
	distribution: ReviewerDistribution[],
	reviewerId: string,
): MunicipalityOption[] => {
	const owners = getMunicipalityOwners(distribution);

	return CONCESSION_MUNICIPALITIES.map((item) => {
		const key = concessionKey(item);
		const owner = owners.get(key);

		return {
			key,
			place: { state: item.state, municipality: item.name },
			label: `${item.name} (${item.state})`,
			heldBy: owner && owner.id !== reviewerId ? owner.name : undefined,
		};
	}).sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
};

/** Sorted the way the screen lists them, by name. */
export const sortMunicipalities = (places: readonly ReviewerMunicipality[]) =>
	[...places].sort((a, b) =>
		a.municipality.localeCompare(b.municipality, "pt-BR"),
	);
