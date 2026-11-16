import { AdminDashboardPage, DesignerDashboardPage } from "@features/dashboard";
import { useAuthStore } from "@features/shared";
import { pageTitle } from "@lib/page-title";
import { ROLE_ACCESS, requireRoles } from "@lib/route-guard";
import { createFileRoute } from "@tanstack/react-router";

const DashboardRoute = () => {
	const role = useAuthStore((state) => state.user?.role);

	if (role === "admin") {
		return <AdminDashboardPage />;
	}

	return <DesignerDashboardPage />;
};

export const Route = createFileRoute("/painel")({
	beforeLoad: requireRoles(ROLE_ACCESS.dashboard),
	head: () => ({ meta: [{ title: pageTitle("Painel") }] }),
	component: DashboardRoute,
});
