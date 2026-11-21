import type { ReviewDashboard } from "@services/dashboard";

export const reviewDashboardOf = (
	overrides: Partial<ReviewDashboard> = {},
): ReviewDashboard => ({
	totals: { received: 31, approved: 14, rejected: 9, underReview: 8 },
	averageReviewDays: 6.5,
	averageCycleDays: null,
	weekly: [
		{ weekStart: "2026-11-02", received: 7, decided: 5 },
		{ weekStart: "2026-11-09", received: 4, decided: 6 },
	],
	monthlyRejection: [{ month: "2026-10", rejectionPercent: 40 }],
	deadlines: { met: 20, overdue: 3 },
	findingsRanking: [
		{
			stage: "CALCULATION",
			standardItem: "Fator de demanda",
			total: 12,
			projects: [
				{ id: "41", name: "Edifício Aurora", protocol: "2026-0481" },
				{ id: "42", name: "Residencial Boa Vista", protocol: "2026-0482" },
			],
		},
		{ stage: "DOCUMENTS", standardItem: null, total: 4, projects: [] },
	],
	municipalities: [{ municipality: "Recife", state: "PE", total: 11 }],
	repeatedRejections: [
		{ id: "50", name: "Comercial Derby", protocol: "2026-0490", rejections: 3 },
	],
	alertsByCategory: [
		{ category: "RESIDENTIAL_MULTIFAMILY", alerts: 15, projects: 10 },
		{ category: "NON_RESIDENTIAL", alerts: 1, projects: 1 },
	],
	...overrides,
});
