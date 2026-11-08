import type { AttentionMessage } from "@components/AttentionIndicator";
import type { NormativeTable } from "@services/normative-tables";

/** A draft waits on a second administrator, so only someone else's draft is a pending task. */
export const getNormativeTableAction = (
	table: NormativeTable,
	email: string | undefined,
) => {
	if (table.status !== "DRAFT") return { label: "Ver Tabela", required: false };

	const isOwnDraft = table.registeredBy.toLowerCase() === email?.toLowerCase();

	return isOwnDraft
		? { label: "Editar", required: false }
		: { label: "Revisar", required: true };
};

/** The gutter bar: someone else's draft waiting for this administrator's review. */
export const getNormativeTableAttention = (
	table: NormativeTable,
	email: string | undefined,
	canReview: boolean,
): AttentionMessage | null =>
	canReview && getNormativeTableAction(table, email).required
		? {
				severity: "warning",
				title: "Aguardando sua revisão",
				details: [`Cadastrada por ${table.registeredBy}`],
				action: "Revise a tabela para publicá-la.",
			}
		: null;
