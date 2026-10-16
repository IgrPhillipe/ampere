import type { Finding, FindingPayload } from "@services/project-review";
import { documentTypeSchema } from "@services/submission";

import type { FindingFormValues } from "../../schemas";
import type { FindingReferenceOptions } from "../../types";

export const toFindingPayload = (
	values: FindingFormValues,
	options: FindingReferenceOptions,
): FindingPayload => {
	const reference = Object.hasOwn(options[values.stage], values.reference)
		? values.reference
		: "";
	const documentType = documentTypeSchema.safeParse(reference);

	return {
		severity: values.severity,
		stage: values.stage,
		consumerUnitGroupId:
			values.stage === "CONSUMER_UNITS" && reference ? Number(reference) : null,
		calculationStepCode:
			values.stage === "CALCULATION" && reference ? reference : null,
		documentType:
			values.stage === "DOCUMENTS" && documentType.success
				? documentType.data
				: null,
		description: values.description.trim(),
		standardItem: values.standardItem.trim() || null,
	};
};

export const toFindingFormValues = (finding: Finding): FindingFormValues => ({
	severity: finding.severity,
	stage: finding.stage,
	reference:
		finding.consumerUnitGroupId ??
		finding.calculationStepCode ??
		finding.documentType ??
		"",
	description: finding.description,
	standardItem: finding.standardItem ?? "",
});

export const describeFindingReference = (
	finding: Finding,
	options: FindingReferenceOptions,
) => {
	const reference =
		finding.consumerUnitGroupId ??
		finding.calculationStepCode ??
		finding.documentType;

	return reference ? (options[finding.stage][reference] ?? reference) : null;
};

interface ReferenceSources {
	groups: { id: string; name: string }[];
	steps: { code: string; title: string }[];
	checklistItems: { key: string; label: string }[];
}

/** What each stage can point to: the groups, the demand steps and the attached documents. */
export const buildFindingReferenceOptions = ({
	groups,
	steps,
	checklistItems,
}: ReferenceSources): FindingReferenceOptions => ({
	PROJECT_DATA: {},
	CONSUMER_UNITS: Object.fromEntries(
		groups.map((group) => [group.id, group.name]),
	),
	CALCULATION: Object.fromEntries(
		steps.map((step) => [step.code, `${step.title} (${step.code})`]),
	),
	DOCUMENTS: Object.fromEntries(
		checklistItems
			.filter((item) => item.key !== "CALCULATION")
			.map((item) => [item.key, item.label]),
	),
});
