import { formatDecimal } from "@features/shared";
import type { UnitConnectionType } from "@services/consumer-units";

import {
	LOW_VOLTAGE_LIMIT_KW,
	powerUnitKw,
	SINGLE_PHASE_LIMIT_KW,
} from "../../constants";
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

/** Same checks the back runs on the group (DIS-NOR-030 item 6.2.1 and Tabela 2). */
export const unitLoadNotice = (
	connectionType: UnitConnectionType | undefined,
	loadKw: number,
) => {
	const load = formatDecimal(loadKw);

	if (loadKw > LOW_VOLTAGE_LIMIT_KW) {
		return `Carga instalada de ${load} kW por unidade passa do limite de 75 kW da baixa tensão (DIS-NOR-030, item 6.2.1).`;
	}

	if (connectionType === "SINGLE_PHASE" && loadKw > SINGLE_PHASE_LIMIT_KW) {
		return `Carga instalada de ${load} kW passa de 15 kW, teto da ligação monofásica (DIS-NOR-030, Anexo I, Tabela 2, categoria M3): confirme a ligação do apartamento.`;
	}

	return null;
};
