import type { NormativeTableStatus } from "@services/normative-tables";

export const normativeTableStatusLabels = {
	DRAFT: "Rascunho",
	PUBLISHED: "Publicada",
	SUPERSEDED: "Substituída",
} as const satisfies Record<NormativeTableStatus, string>;

export const normativeTableStatusBadgeVariants = {
	DRAFT: "warning",
	PUBLISHED: "success",
	SUPERSEDED: "outline",
} as const satisfies Record<NormativeTableStatus, string>;
