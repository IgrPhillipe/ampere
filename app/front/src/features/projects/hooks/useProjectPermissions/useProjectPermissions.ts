import { type UserRole, useAuthStore } from "@features/shared";
import type { ProjectStatus } from "@services/projects";

export interface ProjectPermissions {
	/** Data, units and calculation: a draft, or a rejection being corrected. */
	canEdit: boolean;
	/** The documents also stay open while the project waits for its submission. */
	canEditDocuments: boolean;
	canDelete: boolean;
	/** Answering findings and submitting speak for the designer who owns the project. */
	isOwner: boolean;
}

export interface PermissionTarget {
	status: ProjectStatus;
	ownerId?: string | null;
}

/** Mirrors the back: the admin skips the owner rule, never the status rules. */
export const getProjectPermissions = (
	role: UserRole | undefined,
	userId: string | undefined,
	project: PermissionTarget | undefined,
): ProjectPermissions => {
	const canWrite = role === "user" || role === "admin";
	const status = project?.status;

	return {
		canEdit: canWrite && (status === "DRAFT" || status === "REJECTED"),
		canEditDocuments:
			canWrite &&
			(status === "DRAFT" ||
				status === "AWAITING_SUBMISSION" ||
				status === "REJECTED"),
		canDelete: canWrite && status === "DRAFT",
		isOwner: canWrite && userId !== undefined && project?.ownerId === userId,
	};
};

export const useProjectPermissions = (
	project: PermissionTarget | undefined,
) => {
	const role = useAuthStore((state) => state.user?.role);
	const userId = useAuthStore((state) => state.user?.id);

	return getProjectPermissions(role, userId, project);
};
