export const PROJECT_DETAIL_TABS = [
	"memoria",
	"unidades",
	"documentos",
	"memorial",
	"historico",
] as const;

export type ProjectDetailTab = (typeof PROJECT_DETAIL_TABS)[number];
