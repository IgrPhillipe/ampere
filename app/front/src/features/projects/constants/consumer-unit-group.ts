import type {
	EvStationType,
	GroupKind,
	GroupStatus,
	LampTechnology,
	LoadCategory,
	LoadUsage,
	PowerUnit,
} from "@services/consumer-units";

// Os mapas sao `Record<Enum, string>` de proposito: um caso novo do back sem
// rotulo aqui quebra o type-check, em vez de aparecer vazio na tela.

export const groupStatusLabels = {
	VALIDATED: "Validado",
	REVIEW: "Revisar",
	MISSING_DATA: "Falta dado",
} as const satisfies Record<GroupStatus, string>;

export const groupKindLabels = {
	RESIDENTIAL: "Apartamento",
	LOAD: "Carga instalada",
	EV_CHARGING: "Recarga de veículo elétrico",
} as const satisfies Record<GroupKind, string>;

/**
 * O "Tipo de uso" do prototipo H3a. Junta o tipo do grupo e, na carga
 * instalada, se ela e do condominio ou comercial: para quem preenche sao
 * quatro escolhas, nao duas perguntas.
 */
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

/** Parcelas da DIS-NOR-030, item 6.27, com a letra da norma. */
export const loadCategoryItems = {
	LIGHTING_AND_OUTLETS: "a · Iluminação e tomadas",
	INSTANT_HEATING: "b · Chuveiros, torneiras e aquecedores de passagem",
	STORAGE_HEATING: "c · Aquecedor central ou de acumulação",
	APPLIANCES: "d · Secadoras, lava-roupas, lava-louças e micro-ondas",
	COOKING: "e · Fornos e fogões elétricos",
	AIR_CONDITIONING: "f · Condicionadores de ar",
	MOTORS: "g · Motores e máquinas de solda a motor",
	SPECIAL_EQUIPMENT: "h · Equipamentos especiais",
	PUMPS_AND_HOT_TUBS: "i · Bombas e hidromassagem",
} as const satisfies Record<LoadCategory, string>;

export const lampTechnologyItems = {
	FLUORESCENT_NEON_SODIUM: "Fluorescente, néon ou vapor de sódio",
	COMPACT_FLUORESCENT_LED: "Fluorescente compacta ou LED",
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

/**
 * Sim e nao como select, e nao checkbox: "nao informado" precisa existir, e e
 * ele que o back devolve como pendencia.
 */
export const yesNoItems = { true: "Sim", false: "Não" } as const;
