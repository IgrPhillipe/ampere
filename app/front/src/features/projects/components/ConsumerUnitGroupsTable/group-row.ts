import type { ConsumerUnitGroup } from "@services/consumer-units";

export interface GroupRowActions {
	onOpenGroup: (group: ConsumerUnitGroup) => void;
}

export const isPendingGroup = (group: ConsumerUnitGroup) =>
	group.status !== "VALIDATED";

export const loadShare = (group: ConsumerUnitGroup, totalLoadKw: number) =>
	totalLoadKw > 0
		? Math.min(100, (group.declaredLoadKw / totalLoadKw) * 100)
		: 0;
