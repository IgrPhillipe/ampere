import type { ProjectStatus } from "@services/projects";

/** Every project still on its way: none approved or expired. */
export const ACTIVE_PROJECT_STATUSES: ProjectStatus[] = [
	"DRAFT",
	"AWAITING_SUBMISSION",
	"UNDER_REVIEW",
	"REJECTED",
];
