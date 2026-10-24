import type { UserRole } from "@features/shared";
import type { ProjectStatus } from "@services/projects";

export type ProjectDetailAction =
	| "respondFindings"
	| "resubmit"
	| "createFindings"
	| "decide"
	| "edit"
	| "delete";

/** The profiles of the detail screen, split the way the back will split the roles. */
export type ProjectProfile = "designer" | "reviewer" | "admin";

const REVIEWER_ACTIONS: readonly ProjectDetailAction[] = [
	"createFindings",
	"decide",
];

export const PROJECT_PROFILE_ACTIONS: Record<
	ProjectProfile,
	readonly ProjectDetailAction[]
> = {
	designer: ["respondFindings", "resubmit"],
	reviewer: REVIEWER_ACTIONS,
	admin: [...REVIEWER_ACTIONS, "edit", "delete"],
};

/** The session "admin" is today's analyst; it moves to "admin" when the back grants it full access. */
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

/** The single place that decides what each profile does on the project detail. */
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
		edit: granted.has("edit") && status !== undefined,
		delete: granted.has("delete") && status !== undefined,
	};
};
