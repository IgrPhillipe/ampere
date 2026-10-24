import type {
	BuildingCategory,
	ConnectionType,
	EntranceStandard,
	SupplyVoltage,
} from "@services/projects";

// Os mapas sao `Record<Enum, string>` de proposito: um valor fora do contrato
// ou um caso novo do back sem rotulo aqui quebram o type-check, em vez de
// aparecerem como opcao vazia na tela.
export const buildingTypeLabels: Record<BuildingCategory, string> = {
	RESIDENTIAL_MULTIFAMILY: "Residencial multifamiliar",
	NON_RESIDENTIAL: "Não residencial",
	MIXED: "Misto",
};

export const voltageLabels: Record<SupplyVoltage, string> = {
	V220_127: "220/127 V",
	V380_220: "380/220 V",
};

export const connectionTypeLabels: Record<ConnectionType, string> = {
	SINGLE_PHASE: "Monofásico",
	TWO_PHASE: "Bifásico",
	THREE_PHASE: "Trifásico",
};

export const entranceStandardLabels: Record<EntranceStandard, string> = {
	COLLECTIVE: "Coletivo",
	INDIVIDUAL: "Individual",
};
