import type { UnitConnectionType } from "@services/consumer-units";

import type { GroupUsageType } from "../../constants";

const loadLabels: Record<GroupUsageType, string | null> = {
	APARTMENT: "Carga instalada por unidade, em kW",
	COMMON_AREA: null,
	COMMERCIAL: null,
	EV_CHARGING: "Potência por ponto, em kW",
};

/** A three-phase apartment details its loads in the sheet instead. */
export const newGroupLoadLabel = (
	usageType?: GroupUsageType,
	connectionType?: UnitConnectionType,
) => {
	if (!usageType) return null;
	if (usageType === "APARTMENT" && connectionType === "THREE_PHASE") {
		return null;
	}
	return loadLabels[usageType];
};

export const newGroupStatus = (usageType?: GroupUsageType) =>
	usageType ? "Novo grupo" : "Aguardando tipo";
