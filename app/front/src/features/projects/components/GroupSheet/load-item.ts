import type { LoadItem, LoadItemPayload } from "@services/consumer-units";

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
