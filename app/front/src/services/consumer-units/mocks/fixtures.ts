import type { ConsumerUnitGroup } from "../schemas";
import type { ConsumerUnitGroupPayload } from "../types";
import { makeGroup } from "./factories";

/** O rascunho dos fixtures de projetos, "Residencial Monte Verde". */
export const MOCK_DRAFT_PROJECT_ID = "4";

/** Os cinco grupos do prototipo H3, os mesmos do `DataSeeder` do back. */
const H3_GROUPS: ConsumerUnitGroupPayload[] = [
	{
		kind: "RESIDENTIAL",
		name: "Apartamento tipo A",
		quantity: 24,
		usefulArea: 68,
		bedrooms: 2,
		unitLoadKw: 6.5,
		compactUnit: false,
	},
	{
		kind: "RESIDENTIAL",
		name: "Apartamento tipo B",
		quantity: 20,
		usefulArea: 92,
		bedrooms: 3,
		unitLoadKw: 8.2,
		compactUnit: false,
	},
	{
		kind: "RESIDENTIAL",
		name: "Cobertura duplex",
		quantity: 4,
		usefulArea: 140,
		bedrooms: 4,
		unitLoadKw: 11.4,
		compactUnit: false,
	},
	{
		kind: "LOAD",
		name: "Área comum",
		quantity: 1,
		usage: "COMMON_AREA",
		items: [
			{
				category: "MOTORS",
				description: "Elevador",
				quantity: 1,
				power: 12,
				powerUnit: "CV",
			},
			{
				category: "PUMPS_AND_HOT_TUBS",
				description: "Bombas de recalque",
				quantity: 2,
				power: 5,
				powerUnit: "CV",
			},
			{
				category: "LIGHTING_AND_OUTLETS",
				description: "Iluminação e tomadas",
				quantity: 1,
				power: 25.8,
				powerUnit: "KW",
			},
		],
	},
	{
		kind: "EV_CHARGING",
		name: "Recarga de veículo elétrico",
		quantity: 6,
		powerPerPointKw: 7.4,
		incorporatedInVehicle: false,
		stationType: "COLLECTIVE",
	},
];

export const MOCK_GROUPS: Record<string, ConsumerUnitGroup[]> = {
	[MOCK_DRAFT_PROJECT_ID]: H3_GROUPS.map((payload, index) =>
		makeGroup(String(index + 1), payload),
	),
};
