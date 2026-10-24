import type { ProjectFindingsFilter } from "@services/projects";

export const projectFindingsFilterLabels = {
	BLOCKING_OPEN: "Bloqueante em aberto",
	ANY_OPEN: "Qualquer em aberto",
	NONE_OPEN: "Sem apontamento em aberto",
} as const satisfies Record<ProjectFindingsFilter, string>;
