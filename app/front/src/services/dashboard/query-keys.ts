import type { DashboardPeriod } from "./schemas";

export const dashboardKeys = {
	all: () => ["dashboard"] as const,
	designer: (period: DashboardPeriod) =>
		[...dashboardKeys.all(), "designer", period] as const,
};
