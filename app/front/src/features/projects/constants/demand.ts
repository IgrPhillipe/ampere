import type { DemandCode } from "@services/calculation";

/** Series colours of prototype H4: residential green, common areas blue, charging orange. */
export const demandSeriesClassNames = {
	Drf: "bg-chart-1",
	Ds: "bg-chart-3",
	Dc: "bg-chart-2",
	Dve: "bg-chart-4",
	Ded: "bg-transparent",
} as const satisfies Record<DemandCode, string>;
