import { formatDecimal } from "@features/shared";
import type { UnitConnectionType } from "@services/consumer-units";

import {
	LOW_VOLTAGE_LIMIT_KW,
	powerUnitKw,
	SINGLE_PHASE_LIMIT_KW,
} from "../../constants";
import type { LoadItemFormValues } from "../../schemas";

type LoadLike = Pick<LoadItemFormValues, "quantity" | "power" | "powerUnit">;

type RatedLike = Pick<LoadItemFormValues, "category" | "powerUnit">;

/** Form values arrive as strings while the user types. */
const toNumber = (value: unknown) => {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : 0;
};

/** Sum of the plate powers in kW; the back rates motors by Tabela 18 or 19 when it saves. */
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

/** Loads the back reads from Tabelas 11, 18 and 19 when it saves, not from the plate. */
export const ratedByTable = ({ category, powerUnit }: RatedLike) =>
	category === "MOTORS" ||
	(category === "PUMPS_AND_HOT_TUBS" && powerUnit !== "KW") ||
	(category === "AIR_CONDITIONING" && powerUnit === "BTU_H");

export const TABLE_RATED_NOTICE =
	"Condicionadores em BTU/h, motores e bombas em CV ou HP entram pela tabela da norma ao salvar. O total e o limite de 75 kW só se confirmam depois disso.";

export const tableRatedNotice = (items: RatedLike[]) =>
	items.some(ratedByTable) ? TABLE_RATED_NOTICE : null;

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
