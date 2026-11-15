import type { ConsumerUnitGroup } from "@services/consumer-units";

import { unitConnectionTypeItems } from "../../constants";

/** Only an apartment has its own connection; the other groups follow the building's. */
export const groupConnectionLabel = (group: ConsumerUnitGroup) => {
	if (group.kind !== "RESIDENTIAL") return "Edificação";
	return group.connectionType
		? unitConnectionTypeItems[group.connectionType]
		: "Não informada";
};
