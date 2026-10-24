import type { UserRole } from "@features/shared";
import type { ProjectStatus } from "@services/projects";

export type ProjectDetailAction =
	| "respondFindings"
	| "resubmit"
	| "createFindings"
	| "decide";

export type ProjectProfile = "designer" | "reviewer";

export const PROJECT_PROFILE_ACTIONS: Record<
	ProjectProfile,
	readonly ProjectDetailAction[]
> = {
	designer: ["respondFindings", "resubmit"],
	reviewer: ["createFindings", "decide"],
};

/** The session "admin" is today's analyst. */
const PROFILE_BY_ROLE: Record<UserRole, ProjectProfile> = {
	user: "designer",
	admin: "reviewer",
};

export const getProjectProfile = (role: UserRole) => PROFILE_BY_ROLE[role];

export type ProjectDetailActions = Record<ProjectDetailAction, boolean>;

interface ProjectDetailContext {
	profile: ProjectProfile | undefined;
	status: ProjectStatus | undefined;
	/** The analyst holds the review, so nobody else decides it. */
	holdsReview?: boolean;
}

export const getProjectDetailActions = ({
	profile,
	status,
	holdsReview = false,
}: ProjectDetailContext): ProjectDetailActions => {
	const granted = new Set(profile ? PROJECT_PROFILE_ACTIONS[profile] : []);
	const reviewing = status === "UNDER_REVIEW" && holdsReview;

	return {
		respondFindings: granted.has("respondFindings") && status === "REJECTED",
		resubmit: granted.has("resubmit") && status === "REJECTED",
		createFindings: granted.has("createFindings") && reviewing,
		decide: granted.has("decide") && reviewing,
	};
};
