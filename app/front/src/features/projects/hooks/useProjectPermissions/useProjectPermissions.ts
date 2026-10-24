import { type UserRole, useAuthStore } from "@features/shared";
import type { ProjectStatus } from "@services/projects";

export interface ProjectPermissions {
	/** Data, units and calculation: a draft, or a rejection being corrected. */
	canEdit: boolean;
	/** The documents also stay open while the project waits for its submission. */
	canEditDocuments: boolean;
	/** Only a draft, unless the admin deletes it. */
	canDelete: boolean;
	/** "Editar Projeto" past the draft is the admin's alone. */
	canEditInAnyStatus: boolean;
}

/** Mirrors the back: the admin writes any project, the designer a draft or a rejection. */
export const getProjectPermissions = (
	role: UserRole | undefined,
	status: ProjectStatus | undefined,
): ProjectPermissions => {
	const isAdmin = role === "admin";
	const isDesigner = role === "user";

	return {
		canEdit:
			isAdmin || (isDesigner && (status === "DRAFT" || status === "REJECTED")),
		canEditDocuments:
			isAdmin ||
			(isDesigner &&
				(status === "DRAFT" ||
					status === "AWAITING_SUBMISSION" ||
					status === "REJECTED")),
		canDelete: isAdmin || (isDesigner && status === "DRAFT"),
		canEditInAnyStatus: isAdmin,
	};
};

export const useProjectPermissions = (status: ProjectStatus | undefined) => {
	const role = useAuthStore((state) => state.user?.role);

	return getProjectPermissions(role, status);
};
