import type { GroupUsageType } from "../../constants";

/**
 * O que a carga da linha nova significa depende do tipo: por unidade no
 * apartamento, por ponto na recarga. Na carga instalada ela sai da soma dos
 * itens, que se informam depois, entao o campo nao existe.
 */
const loadLabels: Record<GroupUsageType, string | null> = {
	APARTMENT: "Carga instalada por unidade, em kW",
	COMMON_AREA: null,
	COMMERCIAL: null,
	EV_CHARGING: "Potência por ponto, em kW",
};

export const newGroupLoadLabel = (usageType?: GroupUsageType) =>
	usageType ? loadLabels[usageType] : null;

/** Situacao da linha nova: sem tipo nao ha o que validar ainda. */
export const newGroupStatus = (usageType?: GroupUsageType) =>
	usageType ? "Novo grupo" : "Aguardando tipo";
