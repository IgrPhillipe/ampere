import type { Finding } from "@services/project-review";

export const isDraftFinding = (finding: Finding) => finding.status === "DRAFT";

export const isPendingFinding = (finding: Finding) =>
	finding.status !== "RESOLVED";

export const isOpenBlockingFinding = (finding: Finding) =>
	finding.severity === "BLOCKING" && isPendingFinding(finding);

/** Same rule as the API: a rejection rests on a draft or on a reopened finding. */
const supportsRejection = (finding: Finding) =>
	finding.status === "DRAFT" || finding.status === "OPEN";

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

	const approveBlockedReason =
		openBlocking.length === 0
			? null
			: openBlocking.some(isDraftFinding)
				? "Exclua o apontamento bloqueante ou reprove o projeto."
				: "Aceite a correção dos apontamentos bloqueantes ou reprove o projeto.";

	return {
		pendingCount: findings.filter(isPendingFinding).length,
		blockingCount: openBlocking.length,
		approveBlockedReason,
		rejectBlockedReason: findings.some(supportsRejection)
			? null
			: "Registre um apontamento ou reabra um anterior para reprovar o projeto.",
	};
};
