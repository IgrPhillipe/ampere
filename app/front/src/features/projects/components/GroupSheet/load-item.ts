import type {
	LoadCategory,
	LoadItem,
	LoadItemPayload,
	PowerUnit,
} from "@services/consumer-units";

import { powerUnitItems } from "../../constants";
import { type LoadItemFormValues, toBoolean, toYesNo } from "../../schemas";

export const EMPTY_LOAD_ITEM: LoadItemFormValues = {
	category: "LIGHTING_AND_OUTLETS",
	description: "",
	quantity: 1,
	power: null,
	powerUnit: "KW",
	lampTechnology: null,
	simultaneousStart: null,
};

/** BTU/h is a capacity for air conditioners (Tabela 11); kept while chosen, so the back flags it. */
export const powerUnitItemsFor = (
	category: LoadCategory,
	powerUnit?: PowerUnit,
) => {
	if (category === "AIR_CONDITIONING" || powerUnit === "BTU_H") {
		return powerUnitItems;
	}
	const { BTU_H: _capacity, ...plate } = powerUnitItems;
	return plate;
};

export const toLoadItemFormValues = (item: LoadItem): LoadItemFormValues => ({
	category: item.category,
	description: item.description,
	quantity: item.quantity,
	power: item.power ?? null,
	powerUnit: item.powerUnit,
	lampTechnology: item.lampTechnology ?? null,
	simultaneousStart: toYesNo(item.simultaneousStart),
});

export const toLoadItemPayload = (
	item: LoadItemFormValues,
): LoadItemPayload => ({
	...item,
	simultaneousStart: toBoolean(item.simultaneousStart),
});
