import type { DashboardPeriod } from "@services/dashboard";

export const DEFAULT_DASHBOARD_PERIOD: DashboardPeriod = "LAST_30_DAYS";

export const dashboardPeriodLabels = {
	LAST_30_DAYS: "Últimos 30 Dias",
	LAST_90_DAYS: "Últimos 90 Dias",
	CURRENT_YEAR: "Ano Corrente",
} as const satisfies Record<DashboardPeriod, string>;
