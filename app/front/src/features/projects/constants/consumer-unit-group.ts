import type {
	EvStationType,
	GroupKind,
	GroupStatus,
	LampTechnology,
	LoadCategory,
	LoadUsage,
	PowerUnit,
} from "@services/consumer-units";

export const groupStatusLabels = {
	VALIDATED: "Validado",
	REVIEW: "Revisar",
	MISSING_DATA: "Falta Dado",
} as const satisfies Record<GroupStatus, string>;

export const groupKindLabels = {
	RESIDENTIAL: "Apartamento",
	LOAD: "Carga instalada",
	EV_CHARGING: "Recarga de veículo elétrico",
} as const satisfies Record<GroupKind, string>;

export const GROUP_USAGE_TYPES = {
	APARTMENT: { label: "Apartamento", kind: "RESIDENTIAL", usage: null },
	COMMON_AREA: { label: "Área comum", kind: "LOAD", usage: "COMMON_AREA" },
	COMMERCIAL: { label: "Carga comercial", kind: "LOAD", usage: "COMMERCIAL" },
	EV_CHARGING: {
		label: "Recarga de veículo elétrico",
		kind: "EV_CHARGING",
		usage: null,
	},
} as const satisfies Record<
	string,
	{ label: string; kind: GroupKind; usage: LoadUsage | null }
>;

export type GroupUsageType = keyof typeof GROUP_USAGE_TYPES;

export const groupUsageTypeItems = Object.fromEntries(
	Object.entries(GROUP_USAGE_TYPES).map(([value, { label }]) => [value, label]),
) as Record<GroupUsageType, string>;

export const loadUsageItems = {
	COMMON_AREA: "Área comum",
	COMMERCIAL: "Carga comercial",
} as const satisfies Record<LoadUsage, string>;

export const loadCategoryItems = {
	LIGHTING_AND_OUTLETS: "a) Iluminação e tomadas",
	INSTANT_HEATING: "b) Chuveiros, torneiras e aquecedores de passagem",
	STORAGE_HEATING: "c) Aquecedor central ou de acumulação",
	APPLIANCES: "d) Secadoras, lava-roupas, lava-louças e micro-ondas",
	COOKING: "e) Fornos e fogões elétricos",
	AIR_CONDITIONING: "f) Condicionadores de ar",
	MOTORS: "g) Motores e máquinas de solda a motor",
	SPECIAL_EQUIPMENT: "h) Equipamentos especiais",
	PUMPS_AND_HOT_TUBS: "i) Bombas e hidromassagem",
} as const satisfies Record<LoadCategory, string>;

export const lampTechnologyItems = {
	FLUORESCENT_NEON_SODIUM: "Iluminação fluorescente, néon ou vapor de sódio",
	COMPACT_FLUORESCENT_LED: "Iluminação fluorescente compacta ou LED",
	GENERAL_OUTLETS: "Tomadas de uso geral",
} as const satisfies Record<LampTechnology, string>;

export const powerUnitItems = {
	KW: "kW",
	CV: "CV",
	HP: "HP",
} as const satisfies Record<PowerUnit, string>;

export const evStationTypeItems = {
	INDIVIDUAL: "Individualizado por unidade",
	COLLECTIVE: "Coletivo",
} as const satisfies Record<EvStationType, string>;

/** A select, not a checkbox: "not informed" has to exist. */
export const yesNoItems = { true: "Sim", false: "Não" } as const;
