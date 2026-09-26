import type {
	EvStationType,
	GroupKind,
	LampTechnology,
	LoadCategory,
	LoadUsage,
	PowerUnit,
} from "./schemas";

export interface LoadItemPayload {
	category: LoadCategory;
	description: string;
	quantity: number;
	power?: number | null;
	powerUnit: PowerUnit;
	lampTechnology?: LampTechnology | null;
	simultaneousStart?: boolean | null;
}

/**
 * Corpo de `POST` e `PUT /projects/{id}/groups`. `kind` diz quais dos demais
 * campos o back le. Dado normativo pode ir vazio: o grupo e salvo e volta com
 * a pendencia.
 */
export interface ConsumerUnitGroupPayload {
	kind: GroupKind;
	name: string;
	quantity: number;
	usefulArea?: number | null;
	bedrooms?: number | null;
	unitLoadKw?: number | null;
	compactUnit?: boolean | null;
	usage?: LoadUsage | null;
	items?: LoadItemPayload[] | null;
	powerPerPointKw?: number | null;
	incorporatedInVehicle?: boolean | null;
	loadManagement?: boolean | null;
	stationType?: EvStationType | null;
}
