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
