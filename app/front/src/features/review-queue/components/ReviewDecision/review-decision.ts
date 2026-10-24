import type { Finding, ReviewDecision } from "@services/project-review";

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
	/** The only decision the findings allow; `null` while answers await the analyst. */
	decision: ReviewDecision | null;
	blockedReason: string | null;
}

/** Same rules as the API: pending findings reject, a fully resolved set approves. */
export const getDecisionAvailability = (
	findings: Finding[],
): DecisionAvailability => {
	const decision: ReviewDecision | null = findings.some(supportsRejection)
		? "REJECT"
		: findings.every((finding) => finding.status === "RESOLVED")
			? "APPROVE"
			: null;

	return {
		pendingCount: findings.filter(isPendingFinding).length,
		blockingCount: findings.filter(isOpenBlockingFinding).length,
		decision,
		blockedReason:
			decision === null
				? "Aceite ou reabra os apontamentos respondidos para concluir a análise."
				: null,
	};
};
