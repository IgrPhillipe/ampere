import type { AttentionMessage } from "@components/AttentionIndicator";
import type {
	NormativeTable,
	NormativeTableListing,
} from "@services/normative-tables";

type ListedTable = NormativeTable &
	Pick<NormativeTableListing, "pendingRevision">;

/** The revision a line opens: the draft waiting for review, when the line shows another one. */
export const getNormativeTableTarget = (table: ListedTable): NormativeTable =>
	table.pendingRevision ?? table;

/** A draft waits on a second person, so only someone else's draft is a pending task. */
export const getNormativeTableAction = (
	table: ListedTable,
	email: string | undefined,
) => {
	const target = getNormativeTableTarget(table);

	if (target.status !== "DRAFT")
		return { label: "Ver Tabela", required: false };

	const isOwnDraft = target.registeredBy.toLowerCase() === email?.toLowerCase();

	return isOwnDraft
		? { label: "Editar", required: false }
		: { label: "Revisar", required: true };
};

/** The gutter bar: someone else's draft waiting for this person's review. */
export const getNormativeTableAttention = (
	table: ListedTable,
	email: string | undefined,
	canReview: boolean,
): AttentionMessage | null =>
	canReview && getNormativeTableAction(table, email).required
		? {
				severity: "warning",
				title: "Aguardando sua revisão",
				details: [
					`Cadastrada por ${getNormativeTableTarget(table).registeredByName}`,
				],
				action: "Confira a revisão para aprová-la.",
			}
		: null;
