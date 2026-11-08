import {
	type FindingStage,
	findingStageSchema,
} from "@services/project-review";

export type ProjectSectionKey =
	| "overview"
	| "data"
	| "units"
	| "calculation"
	| "memorial"
	| "documents"
	| "history";

export const PROJECT_SECTIONS = [
	{ key: "overview", index: "00", label: "Visão Geral", to: "/projetos/$id" },
	{
		key: "data",
		index: "01",
		label: "Dados da Edificação",
		to: "/projetos/$id/dados",
	},
	{
		key: "units",
		index: "02",
		label: "Unidades Consumidoras",
		to: "/projetos/$id/unidades",
	},
	{
		key: "calculation",
		index: "03",
		label: "Cálculo de Demanda",
		to: "/projetos/$id/calculo",
	},
	{
		key: "memorial",
		index: "04",
		label: "Memorial",
		to: "/projetos/$id/memorial",
	},
	{
		key: "documents",
		index: "05",
		label: "Documentos",
		to: "/projetos/$id/documentos",
	},
	{
		key: "history",
		index: "06",
		label: "Histórico",
		to: "/projetos/$id/historico",
	},
] as const satisfies readonly {
	key: ProjectSectionKey;
	/** Mono step number of the strip; the Figma's five steps keep 01 to 05. */
	index: string;
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

/** The stage a finding opened from this section belongs to, when it has one. */
export const sectionStage = (
	key: ProjectSectionKey,
): FindingStage | undefined =>
	findingStageSchema.options.find((stage) => stageSections[stage] === key);

export const sectionPath = (key: ProjectSectionKey): ProjectSectionPath =>
	PROJECT_SECTIONS.find((section) => section.key === key)?.to ??
	"/projetos/$id";
