import { http } from "@lib/http";

import { DashboardEndpoints as e } from "./endpoints";
import {
	type DashboardPeriod,
	designerDashboardResponseSchema,
} from "./schemas";

export const getDesignerDashboard = async (period: DashboardPeriod) => {
	const response = await http
		.get(e.designer, { searchParams: { period } })
		.json<unknown>();

	return designerDashboardResponseSchema.parse(response);
};
