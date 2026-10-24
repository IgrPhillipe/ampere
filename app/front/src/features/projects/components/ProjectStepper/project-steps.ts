import type { ProjectStatus } from "@services/projects";

interface StepProgress {
	status?: ProjectStatus;
	canCalculate?: boolean;
	hasCalculation: boolean;
}

const DRAFT_STATUSES: ReadonlySet<ProjectStatus> = new Set([
	"DRAFT",
	"AWAITING_SUBMISSION",
]);

/** Index of the furthest step the project can open, by the rules of each step's "Continuar". */
export const unlockedStepOf = ({
	status,
	canCalculate,
	hasCalculation,
}: StepProgress) => {
	if (status && !DRAFT_STATUSES.has(status)) return 4;
	if (hasCalculation) return 3;
	if (canCalculate) return 2;
	return 1;
};
