import type {
	EvStationType,
	GroupKind,
	LampTechnology,
	LoadCategory,
	LoadUsage,
	PowerUnit,
	UnitConnectionType,
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

export interface ConsumerUnitGroupPayload {
	kind: GroupKind;
	name: string;
	quantity: number;
	usefulArea?: number | null;
	bedrooms?: number | null;
	unitLoadKw?: number | null;
	compactUnit?: boolean | null;
	connectionType?: UnitConnectionType | null;
	loads?: LoadItemPayload[] | null;
	usage?: LoadUsage | null;
	items?: LoadItemPayload[] | null;
	powerPerPointKw?: number | null;
	incorporatedInVehicle?: boolean | null;
	loadManagement?: boolean | null;
	stationType?: EvStationType | null;
}
