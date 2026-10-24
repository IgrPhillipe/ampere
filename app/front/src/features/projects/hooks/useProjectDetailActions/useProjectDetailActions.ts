import { useAuthStore } from "@features/shared";
import type { ProjectStatus } from "@services/projects";

import { getProjectDetailActions, getProjectProfile } from "../../constants";

interface UseProjectDetailActionsOptions {
	status: ProjectStatus | undefined;
	ownerId?: string | null;
	holdsReview?: boolean;
}

export const useProjectDetailActions = ({
	status,
	ownerId,
	holdsReview,
}: UseProjectDetailActionsOptions) => {
	const role = useAuthStore((state) => state.user?.role);
	const userId = useAuthStore((state) => state.user?.id);

	return getProjectDetailActions({
		profile: role
			? getProjectProfile(role, ownerId != null && ownerId === userId)
			: undefined,
		status,
		holdsReview,
	});
};
