import type { BadgeProps } from "@components/ui/badge";
import type { DemandCode } from "@services/calculation";
import type {
	FindingSeverity,
	FindingStage,
	FindingStatus,
} from "@services/project-review";

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

interface CheckFindingTarget {
	stage: FindingStage;
	calculationStepCode?: DemandCode;
}

export const checkFindingTargets: Record<string, CheckFindingTarget> = {
	MINIMUM_BY_VOLTAGE: { stage: "CALCULATION", calculationStepCode: "Ded" },
	PROJECT_SIZE: { stage: "CALCULATION", calculationStepCode: "Ded" },
	NETWORK_STUDY: { stage: "CALCULATION", calculationStepCode: "Dve" },
	TRANSFORMER_LIMIT: { stage: "CALCULATION", calculationStepCode: "Dve" },
	SAFETY_FACTOR: { stage: "CALCULATION", calculationStepCode: "Drf" },
};
