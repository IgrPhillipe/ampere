import type { UnitConnectionType } from "@services/consumer-units";

import { powerUnitKw } from "../../constants";
import type { LoadItemFormValues } from "../../schemas";

type LoadLike = Pick<LoadItemFormValues, "quantity" | "power" | "powerUnit">;

/** Form values arrive as strings while the user types. */
const toNumber = (value: unknown) => {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : 0;
};

/** Sum of the plate powers in kW, as the back adds a three-phase apartment's loads. */
export const sumLoadsKw = (items: LoadLike[]) =>
	items.reduce(
		(total, item) =>
			total +
			toNumber(item.power) *
				toNumber(item.quantity) *
				powerUnitKw[item.powerUnit],
		0,
	);

export const unitInstalledKw = (
	connectionType: UnitConnectionType | undefined,
	unitLoadKw: unknown,
	items: LoadLike[],
) =>
	connectionType === "THREE_PHASE" ? sumLoadsKw(items) : toNumber(unitLoadKw);
