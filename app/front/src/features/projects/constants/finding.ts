import type { BadgeProps } from "@components/ui/badge";
import type {
	Finding,
	FindingSeverity,
	FindingStage,
	FindingStatus,
} from "@services/project-review";
import type { ProjectDetail } from "@services/projects";

export const findingSeverityLabels = {
	BLOCKING: "Bloqueante",
	ADJUSTMENT: "Ajuste",
} as const satisfies Record<FindingSeverity, string>;

export const findingSeverityBadgeVariants = {
	BLOCKING: "destructive",
	ADJUSTMENT: "warning",
} as const satisfies Record<FindingSeverity, BadgeProps["variant"]>;

export const findingStageLabels = {
	PROJECT_DATA: "Dados da Edificação",
	CONSUMER_UNITS: "Unidades Consumidoras",
	CALCULATION: "Cálculo de Demanda",
	DOCUMENTS: "Documentos",
} as const satisfies Record<FindingStage, string>;

export const findingReferenceLabels = {
	PROJECT_DATA: null,
	CONSUMER_UNITS: "Grupo",
	CALCULATION: "Parcela",
	DOCUMENTS: "Documento",
} as const satisfies Record<FindingStage, string | null>;

export const findingStatusLabels = {
	DRAFT: "Rascunho",
	OPEN: "Aberto",
	FIXED: "Corrigido",
	CONTESTED: "Contestado",
	RESOLVED: "Resolvido",
} as const satisfies Record<FindingStatus, string>;

export const findingStatusBadgeVariants = {
	DRAFT: "neutral",
	OPEN: "warning",
	FIXED: "info",
	CONTESTED: "warning",
	RESOLVED: "success",
} as const satisfies Record<FindingStatus, BadgeProps["variant"]>;

export type FindingReferenceOptions = Record<
	FindingStage,
	Record<string, string>
>;

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

/** Same rule as the back: a published finding not yet accepted, on a rejected project. */
export const awaitsDesignerResponse = (
	finding: Finding,
	project: Pick<ProjectDetail, "status">,
) =>
	project.status === "REJECTED" &&
	finding.status !== "DRAFT" &&
	finding.status !== "RESOLVED";

/** The findings a stage marks while the designer corrects the project. */
export const stageFindingsOf = (
	findings: Finding[] | undefined,
	project: Pick<ProjectDetail, "status"> | undefined,
	stage: FindingStage,
) =>
	project
		? (findings ?? []).filter(
				(finding) =>
					finding.stage === stage && awaitsDesignerResponse(finding, project),
			)
		: [];

/** URL hash of the item a finding points to, read by the badge of that item. */
export const findingTarget = (finding: Finding) => {
	if (finding.consumerUnitGroupId)
		return `grupo-${finding.consumerUnitGroupId}`;
	if (finding.calculationStepCode)
		return `parcela-${finding.calculationStepCode}`;
	if (finding.documentType) return `documento-${finding.documentType}`;

	return undefined;
};
