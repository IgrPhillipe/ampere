import type { DemandCode } from "@services/calculation";
import type { FindingStage } from "@services/project-review";

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
