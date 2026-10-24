import { getProjectProfile } from "@features/projects";
import { useAuthStore } from "@features/shared";
import { useGetProject } from "@services/projects";

const REVIEWED_STATUSES = new Set(["UNDER_REVIEW", "APPROVED", "REJECTED"]);

/** Whether the project opens with the review panel: a submitted project seen by an analyst. */
export const useReviewsProject = (projectId: string) => {
	const project = useGetProject(projectId).data?.data;
	const role = useAuthStore((state) => state.user?.role);
	const userId = useAuthStore((state) => state.user?.id);

	if (!project || !role) return false;

	return (
		getProjectProfile(
			role,
			project.ownerId != null && project.ownerId === userId,
		) === "reviewer" && REVIEWED_STATUSES.has(project.status)
	);
};
