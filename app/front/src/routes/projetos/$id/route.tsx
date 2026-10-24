import { ProjectWorkspace } from "@features/projects";
import {
	ProjectReviewWorkspace,
	useReviewsProject,
} from "@features/review-queue";
import { ROLE_ACCESS, requireRoles } from "@lib/route-guard";
import { createFileRoute } from "@tanstack/react-router";

const ProjectWorkspaceRoute = () => {
	const { id } = Route.useParams();
	const reviews = useReviewsProject(id);

	return reviews ? (
		<ProjectReviewWorkspace projectId={id} />
	) : (
		<ProjectWorkspace projectId={id} />
	);
};

export const Route = createFileRoute("/projetos/$id")({
	beforeLoad: requireRoles(ROLE_ACCESS.projectWorkspace),
	component: ProjectWorkspaceRoute,
});
