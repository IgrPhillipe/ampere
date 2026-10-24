import type { NormativeStandardFilter } from "@services/normative-tables";

export const normativeStandardLabels = {
	DIS_NOR_053: "DIS-NOR-053",
	DIS_NOR_030: "DIS-NOR-030",
} as const satisfies Record<NormativeStandardFilter, string>;
