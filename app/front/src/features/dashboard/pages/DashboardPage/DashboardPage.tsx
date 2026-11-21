import { useAuthStore } from "@features/shared";

import { AdminDashboardPage } from "../AdminDashboardPage";
import { DesignerDashboardPage } from "../DesignerDashboardPage";
import { ReviewDashboardPage } from "../ReviewDashboardPage";

/** `/painel`: each role has its own panel. */
export const DashboardPage = () => {
	const role = useAuthStore((state) => state.user?.role);

	if (role === "admin") return <AdminDashboardPage />;
	if (role === "reviewer") return <ReviewDashboardPage />;

	return <DesignerDashboardPage />;
};
