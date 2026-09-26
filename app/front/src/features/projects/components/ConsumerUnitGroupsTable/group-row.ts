import type { ConsumerUnitGroup } from "@services/consumer-units";

export interface GroupRowActions {
	/** Abre o grupo para completar os dados do tipo dele. */
	onOpenGroup: (group: ConsumerUnitGroup) => void;
}

/** Linha que pede acao: leva a marca laranja, como na listagem de projetos. */
export const isPendingGroup = (group: ConsumerUnitGroup) =>
	group.status !== "VALIDATED";

/** Fatia do grupo na carga instalada declarada, de 0 a 100. */
export const loadShare = (group: ConsumerUnitGroup, totalLoadKw: number) =>
	totalLoadKw > 0
		? Math.min(100, (group.declaredLoadKw / totalLoadKw) * 100)
		: 0;
