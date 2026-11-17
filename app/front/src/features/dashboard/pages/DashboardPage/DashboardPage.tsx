import { useAuthStore } from "@features/shared";

import { AdminDashboardPage } from "../AdminDashboardPage";
import { DesignerDashboardPage } from "../DesignerDashboardPage";

/** `/painel` is the home of both the designer and the admin, each with their own panel. */
export const DashboardPage = () => {
	const role = useAuthStore((state) => state.user?.role);

	return role === "admin" ? <AdminDashboardPage /> : <DesignerDashboardPage />;
};
