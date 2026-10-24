import { useGetLatestCalculation } from "@services/calculation";
import { useGetConsumerUnitGroupValidation } from "@services/consumer-units";
import { type FindingStage, useGetFindingList } from "@services/project-review";
import { useGetProject } from "@services/projects";
import { useGetSubmission } from "@services/submission";

import type { ProjectSectionState } from "../../components/ProjectSectionNav";
import {
	awaitsDesignerResponse,
	type ProjectSectionKey,
	stageSections,
} from "../../constants";
import { useProjectPermissions } from "../useProjectPermissions";

export type SectionStates = Partial<
	Record<ProjectSectionKey, ProjectSectionState>
>;

/** Findings per section, keyed the same way as the navigation. */
export const countBySection = (
	stages: FindingStage[],
): Partial<Record<ProjectSectionKey, number>> =>
	stages.reduce<Partial<Record<ProjectSectionKey, number>>>((counts, stage) => {
		const key = stageSections[stage];
		counts[key] = (counts[key] ?? 0) + 1;

		return counts;
	}, {});

/** What every section of a project shares; the queries are cached, so sections reuse them. */
export const useProjectWorkspace = (projectId: string) => {
	const projectQuery = useGetProject(projectId);
	const validationQuery = useGetConsumerUnitGroupValidation(projectId);
	const calculationQuery = useGetLatestCalculation(projectId);
	const submissionQuery = useGetSubmission(projectId);
	const findingsQuery = useGetFindingList(projectId);

	const project = projectQuery.data?.data;
	const permissions = useProjectPermissions(project);
	const validation = validationQuery.data?.data;
	const checklist = submissionQuery.data?.data;
	const findings = findingsQuery.data?.data;
	/** `null` when the project was never calculated, `undefined` while loading. */
	const calculation =
		calculationQuery.data === null ? null : calculationQuery.data?.data;
	const outdated = calculation?.outdated === true;

	const units = validation
		? `${validation.totalUnits} em ${validation.totalGroups} ${
				validation.totalGroups === 1 ? "grupo" : "grupos"
			}`
		: undefined;
	const demandKva =
		calculation === null
			? null
			: calculation
				? calculation.totals.finalKva
				: undefined;

	const awaiting =
		project && findings
			? findings.filter((finding) => awaitsDesignerResponse(finding, project))
			: [];
	const attention = countBySection(awaiting.map(({ stage }) => stage));
	const documentsDone = checklist
		? checklist.items
				.filter((item) => item.key !== "CALCULATION")
				.every((item) => item.completed)
		: false;
	const editing = permissions.canEdit;
	// Everything was complete when the project was sent.
	const sent =
		project?.status === "UNDER_REVIEW" || project?.status === "APPROVED";
	const calculated = Boolean(calculation) && !outdated;

	const sections: SectionStates = {
		data: { done: sent || editing, attention: attention.data },
		units: {
			done: sent || (editing && validation?.canCalculate === true),
			attention: attention.units,
		},
		calculation: {
			done: sent || (editing && calculated),
			outdated: editing && outdated,
			attention: attention.calculation,
		},
		memorial: {
			done: sent || (editing && calculated),
			outdated: editing && outdated,
		},
		documents: {
			done: sent || (editing && documentsDone),
			attention: attention.documents,
		},
	};

	return {
		projectQuery,
		validationQuery,
		calculationQuery,
		submissionQuery,
		findingsQuery,
		project,
		permissions,
		validation,
		checklist,
		findings,
		calculation,
		outdated,
		units,
		demandKva,
		awaiting,
		sections,
	};
};
