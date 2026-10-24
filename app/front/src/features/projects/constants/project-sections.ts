import type { FindingStage } from "@services/project-review";

export type ProjectSectionKey =
	| "overview"
	| "data"
	| "units"
	| "calculation"
	| "documents"
	| "history";

export const PROJECT_SECTIONS = [
	{ key: "overview", label: "Visão Geral", to: "/projetos/$id" },
	{ key: "data", label: "Dados da Edificação", to: "/projetos/$id/dados" },
	{
		key: "units",
		label: "Unidades Consumidoras",
		to: "/projetos/$id/unidades",
	},
	{
		key: "calculation",
		label: "Cálculo de Demanda",
		to: "/projetos/$id/calculo",
	},
	{ key: "documents", label: "Documentos", to: "/projetos/$id/documentos" },
	{ key: "history", label: "Histórico", to: "/projetos/$id/historico" },
] as const satisfies readonly {
	key: ProjectSectionKey;
	label: string;
	to: string;
}[];

export type ProjectSectionPath = (typeof PROJECT_SECTIONS)[number]["to"];

/** The section where the item a finding points to is shown and corrected. */
export const stageSections = {
	PROJECT_DATA: "data",
	CONSUMER_UNITS: "units",
	CALCULATION: "calculation",
	DOCUMENTS: "documents",
} as const satisfies Record<FindingStage, ProjectSectionKey>;

export const sectionPath = (key: ProjectSectionKey): ProjectSectionPath =>
	PROJECT_SECTIONS.find((section) => section.key === key)?.to ??
	"/projetos/$id";
