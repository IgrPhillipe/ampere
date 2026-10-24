import { getProjectsPageTitle, ProjectsPage } from "@features/projects";
import { useAuthStore } from "@features/shared";
import { pageTitle } from "@lib/page-title";
import { ROLE_ACCESS, requireRoles } from "@lib/route-guard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/projetos/")({
	beforeLoad: requireRoles(ROLE_ACCESS.projects),
	head: () => ({
		meta: [
			{
				title: pageTitle(
					getProjectsPageTitle(useAuthStore.getState().user?.role),
				),
			},
		],
	}),
	component: ProjectsPage,
});
