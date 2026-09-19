import type {
	Project,
	ProjectListResponse,
	ProjectStatusCounts,
	ProjectStatusCountsResponse,
} from "../schemas";
import { MOCK_PROJECTS } from "./fixtures";

export const makeProject = (overrides?: Partial<Project>): Project => ({
	...MOCK_PROJECTS[0],
	...overrides,
});

export const makeProjectStatusCounts = (
	projects: Project[] = MOCK_PROJECTS,
): ProjectStatusCounts => ({
	total: projects.length,
	draft: projects.filter(({ status }) => status === "DRAFT").length,
	awaitingSubmission: projects.filter(
		({ status }) => status === "AWAITING_SUBMISSION",
	).length,
	underReview: projects.filter(({ status }) => status === "UNDER_REVIEW")
		.length,
	rejected: projects.filter(({ status }) => status === "REJECTED").length,
	approved: projects.filter(({ status }) => status === "APPROVED").length,
});

interface MakeProjectListOptions {
	projects?: Project[];
	total?: number;
	page?: number;
	pageSize?: number;
}

export const makeProjectList = ({
	projects = MOCK_PROJECTS,
	total = projects.length,
	page = 1,
	pageSize = 20,
}: MakeProjectListOptions = {}): ProjectListResponse => ({
	data: projects,
	pagination: { total, page, pageSize },
});

export const makeProjectStatusCountsResponse = (
	projects: Project[] = MOCK_PROJECTS,
): ProjectStatusCountsResponse => ({
	data: makeProjectStatusCounts(projects),
});
