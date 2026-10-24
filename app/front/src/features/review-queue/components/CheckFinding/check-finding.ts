import type { CalculationCheck } from "@features/projects";

import { checkFindingTargets } from "../../constants";
import type { FindingFormValues } from "../../schemas";

const STANDARD_ITEM =
	/DIS-NOR-\d+(?:\s+Anexo\s+[IVX]+)?,\s*item\s+\d+(?:\.\d+)*/g;

export const extractStandardItem = (message: string) =>
	message.match(STANDARD_ITEM)?.at(-1) ?? "";

export const checkToFindingValues = (
	check: CalculationCheck,
): Partial<FindingFormValues> => {
	const target = checkFindingTargets[check.code] ?? { stage: "CALCULATION" };

	return {
		stage: target.stage,
		reference: target.calculationStepCode ?? "",
		description: check.message,
		standardItem: extractStandardItem(check.message),
	};
};
