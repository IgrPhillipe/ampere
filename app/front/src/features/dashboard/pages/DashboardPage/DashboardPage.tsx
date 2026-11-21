import { useAuthStore } from "@features/shared";

import { AdminDashboardPage } from "../AdminDashboardPage";
import { AnalystDashboardPage } from "../AnalystDashboardPage";
import { DesignerDashboardPage } from "../DesignerDashboardPage";

/** `/painel`: each role has its own panel. */
export const DashboardPage = () => {
	const role = useAuthStore((state) => state.user?.role);

	if (role === "admin") return <AdminDashboardPage />;
	if (role === "reviewer") return <AnalystDashboardPage />;

	return <DesignerDashboardPage />;
};
