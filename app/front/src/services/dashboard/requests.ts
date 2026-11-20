import { http } from "@lib/http";

import { DashboardEndpoints as e } from "./endpoints";
import {
	adminDashboardResponseSchema,
	type DashboardPeriod,
	designerDashboardResponseSchema,
	reviewDashboardResponseSchema,
} from "./schemas";

export const getDesignerDashboard = async (period: DashboardPeriod) => {
	const response = await http
		.get(e.designer, { searchParams: { period } })
		.json<unknown>();

	return designerDashboardResponseSchema.parse(response);
};

export const getAdminDashboard = async () => {
	const response = await http.get(e.admin).json<unknown>();

	return adminDashboardResponseSchema.parse(response);
};

export const getReviewDashboard = async (period: DashboardPeriod) => {
	const response = await http
		.get(e.review, { searchParams: { period } })
		.json<unknown>();

	return reviewDashboardResponseSchema.parse(response);
};
