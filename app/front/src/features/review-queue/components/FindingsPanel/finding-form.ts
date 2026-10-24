import type { FindingReferenceOptions } from "@features/projects";
import type { Finding, FindingPayload } from "@services/project-review";
import { documentTypeSchema } from "@services/submission";

import type { FindingFormValues } from "../../schemas";

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
