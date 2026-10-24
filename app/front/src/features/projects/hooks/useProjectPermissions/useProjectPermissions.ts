import { type UserRole, useAuthStore } from "@features/shared";
import type { ProjectStatus } from "@services/projects";

export interface ProjectPermissions {
	/** Data, units, calculation and deletion. */
	canEdit: boolean;
	/** The documents stay open until the submission. */
	canEditDocuments: boolean;
}

/** Mirrors the back: the admin writes any project in any status, the designer only before the submission. */
export const getProjectPermissions = (
	role: UserRole | undefined,
	status: ProjectStatus | undefined,
): ProjectPermissions => {
	const isAdmin = role === "admin";
	const isDesigner = role === "user";

	return {
		canEdit: isAdmin || (isDesigner && status === "DRAFT"),
		canEditDocuments:
			isAdmin ||
			(isDesigner && (status === "DRAFT" || status === "AWAITING_SUBMISSION")),
	};
};

export const useProjectPermissions = (status: ProjectStatus | undefined) => {
	const role = useAuthStore((state) => state.user?.role);

	return getProjectPermissions(role, status);
};
