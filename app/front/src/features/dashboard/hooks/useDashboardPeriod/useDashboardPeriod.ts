import { dashboardPeriodSchema } from "@services/dashboard";
import { parseAsStringLiteral, useQueryState } from "nuqs";

import { DEFAULT_DASHBOARD_PERIOD } from "../../constants";

/** The period lives in `?period=`, like the API; the default stays out of the URL. */
export const useDashboardPeriod = () =>
	useQueryState(
		"period",
		parseAsStringLiteral(dashboardPeriodSchema.options).withDefault(
			DEFAULT_DASHBOARD_PERIOD,
		),
	);
