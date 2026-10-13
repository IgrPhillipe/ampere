import type { Finding } from "@services/project-review";

export const isCurrentCycleFinding = (finding: Finding) =>
	finding.status === "DRAFT";

export const isPendingFinding = (finding: Finding) =>
	finding.status !== "RESOLVED";

export const isOpenBlockingFinding = (finding: Finding) =>
	finding.severity === "BLOCKING" && isPendingFinding(finding);

export interface DecisionAvailability {
	pendingCount: number;
	blockingCount: number;
	approveBlockedReason: string | null;
	rejectBlockedReason: string | null;
}

export const getDecisionAvailability = (
	findings: Finding[],
): DecisionAvailability => {
	const openBlocking = findings.filter(isOpenBlockingFinding);
	const hasDraft = findings.some(isCurrentCycleFinding);

	const approveBlockedReason =
		openBlocking.length === 0
			? null
			: openBlocking.some(isCurrentCycleFinding)
				? "Exclua o apontamento bloqueante ou reprove o projeto."
				: "Aceite a correção dos apontamentos bloqueantes ou reprove o projeto.";

	return {
		pendingCount: findings.filter(isPendingFinding).length,
		blockingCount: openBlocking.length,
		approveBlockedReason,
		rejectBlockedReason: hasDraft
			? null
			: "Registre ao menos um apontamento nesta análise para reprovar o projeto.",
	};
};
