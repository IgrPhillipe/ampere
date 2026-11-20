import type { DashboardPeriod } from "./schemas";

export const dashboardKeys = {
	all: () => ["dashboard"] as const,
	designer: (period: DashboardPeriod) =>
		[...dashboardKeys.all(), "designer", period] as const,
	admin: () => [...dashboardKeys.all(), "admin"] as const,
	review: (period: DashboardPeriod) =>
		[...dashboardKeys.all(), "review", period] as const,
};
