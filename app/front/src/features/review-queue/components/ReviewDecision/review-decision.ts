import type { Finding, ReviewDecision } from "@services/project-review";

export const isDraftFinding = (finding: Finding) => finding.status === "DRAFT";

export const isPendingFinding = (finding: Finding) =>
	finding.status !== "RESOLVED";

export const isOpenBlockingFinding = (finding: Finding) =>
	finding.severity === "BLOCKING" && isPendingFinding(finding);

/** Same rule as the API: a rejection rests on a draft or on a reopened finding. */
const supportsRejection = (finding: Finding) =>
	finding.status === "DRAFT" || finding.status === "OPEN";

const awaitsAnalyst = (finding: Finding) =>
	finding.status === "FIXED" || finding.status === "CONTESTED";

export interface DecisionAvailability {
	pendingCount: number;
	blockingCount: number;
	/** The decisions the findings allow; empty while answers await the analyst. */
	decisions: ReviewDecision[];
	/** Adjustments an approval leaves on the project as reservations. */
	reservations: Finding[];
	blockedReason: string | null;
}

/** Same rules as the API: pending adjustments allow both decisions, a pending blocking one only rejects. */
export const getDecisionAvailability = (
	findings: Finding[],
): DecisionAvailability => {
	const pending = findings.filter(supportsRejection);
	const reservations = pending.filter(
		(finding) => finding.severity === "ADJUSTMENT",
	);
	const decisions: ReviewDecision[] = findings.some(awaitsAnalyst)
		? []
		: pending.length === 0
			? ["APPROVE"]
			: reservations.length === pending.length
				? ["APPROVE", "REJECT"]
				: ["REJECT"];

	return {
		pendingCount: findings.filter(isPendingFinding).length,
		blockingCount: findings.filter(isOpenBlockingFinding).length,
		decisions,
		reservations: decisions.includes("APPROVE") ? reservations : [],
		blockedReason:
			decisions.length === 0
				? "Aceite ou reabra os apontamentos respondidos para concluir a análise."
				: null,
	};
};
