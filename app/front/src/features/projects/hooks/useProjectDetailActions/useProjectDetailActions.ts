import { useAuthStore } from "@features/shared";
import type { ProjectStatus } from "@services/projects";

import { getProjectDetailActions, getProjectProfile } from "../../constants";

interface UseProjectDetailActionsOptions {
	status: ProjectStatus | undefined;
	holdsReview?: boolean;
}

export const useProjectDetailActions = ({
	status,
	holdsReview,
}: UseProjectDetailActionsOptions) => {
	const role = useAuthStore((state) => state.user?.role);

	return getProjectDetailActions({
		profile: role ? getProjectProfile(role) : undefined,
		status,
		holdsReview,
	});
};
