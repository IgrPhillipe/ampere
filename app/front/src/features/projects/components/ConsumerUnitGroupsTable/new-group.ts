import type { GroupUsageType } from "../../constants";

const loadLabels: Record<GroupUsageType, string | null> = {
	APARTMENT: "Carga instalada por unidade, em kW",
	COMMON_AREA: null,
	COMMERCIAL: null,
	EV_CHARGING: "Potência por ponto, em kW",
};

export const newGroupLoadLabel = (usageType?: GroupUsageType) =>
	usageType ? loadLabels[usageType] : null;

export const newGroupStatus = (usageType?: GroupUsageType) =>
	usageType ? "Novo grupo" : "Aguardando tipo";
