import { getProjectsPageTitle, ProjectsPage } from "@features/projects";
import { ReviewQueuePage } from "@features/review-queue";
import { useAuthStore } from "@features/shared";
import { pageTitle } from "@lib/page-title";
import { ROLE_ACCESS, requireRoles } from "@lib/route-guard";
import { createFileRoute } from "@tanstack/react-router";

/** The analyst's projects are the ones assigned to them, with the review columns. */
const ProjectsRoute = () => {
	const role = useAuthStore((state) => state.user?.role);

	return role === "reviewer" ? <ReviewQueuePage /> : <ProjectsPage />;
};

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
	component: () => <ProjectsRoute />,
});
