import type {
	MyReviewCounts,
	MyReviewDecision,
	MyReviewFilter,
} from "@services/review-queue";

export const myReviewDecisionLabels = {
	APPROVED: "Aprovado",
	REJECTED: "Reprovado",
} as const satisfies Record<MyReviewDecision, string>;

export const myReviewFilterLabels = {
	ALL: "Todos",
	APPROVED: "Aprovados",
	REJECTED: "Reprovados",
} as const satisfies Record<MyReviewFilter, string>;

export const myReviewFilterCountKeys = {
	ALL: "all",
	APPROVED: "approved",
	REJECTED: "rejected",
} as const satisfies Record<MyReviewFilter, keyof MyReviewCounts>;
