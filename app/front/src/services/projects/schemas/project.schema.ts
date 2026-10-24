import { apiResponseSchema, paginatedResponseSchema } from "@features/shared";
import { brazilianStateSchema } from "@services/locations";
import { z } from "zod";

export const projectStatusSchema = z.enum([
	"DRAFT",
	"AWAITING_SUBMISSION",
	"UNDER_REVIEW",
	"REJECTED",
	"APPROVED",
]);

export type ProjectStatus = z.infer<typeof projectStatusSchema>;

export const projectSortSchema = z.enum([
	"name",
	"owner",
	"demand",
	"createdAt",
	"updatedAt",
]);

export type ProjectSort = z.infer<typeof projectSortSchema>;

export const projectFindingsFilterSchema = z.enum([
	"BLOCKING_OPEN",
	"ANY_OPEN",
	"NONE_OPEN",
]);

export type ProjectFindingsFilter = z.infer<typeof projectFindingsFilterSchema>;

export const projectSchema = z.object({
	id: z.string(),
	name: z.string(),
	address: z.string(),
	municipality: z.string(),
	state: brazilianStateSchema,
	protocol: z.string(),
	ownerId: z.string().nullable(),
	ownerName: z.string().nullable(),
	status: projectStatusSchema,
	createdAt: z.iso.datetime({ offset: true }),
	updatedAt: z.iso.datetime({ offset: true }),
	pendingCount: z.number().int().nonnegative(),
	consumerUnitsCount: z.number().int().nonnegative(),
	demandKva: z.number().nullable(),
});

export type Project = z.infer<typeof projectSchema>;

export const projectStatusCountsSchema = z.object({
	total: z.number().int().nonnegative(),
	draft: z.number().int().nonnegative(),
	awaitingSubmission: z.number().int().nonnegative(),
	underReview: z.number().int().nonnegative(),
	rejected: z.number().int().nonnegative(),
	approved: z.number().int().nonnegative(),
});

export type ProjectStatusCounts = z.infer<typeof projectStatusCountsSchema>;

/** `GET /projects` — the page, without the counters. */
export const projectListResponseSchema = paginatedResponseSchema(
	z.array(projectSchema),
);

export type ProjectListResponse = z.infer<typeof projectListResponseSchema>;

/** `GET /projects/status-counts` — global counters, no pagination. */
export const projectStatusCountsResponseSchema = apiResponseSchema(
	projectStatusCountsSchema,
);

export type ProjectStatusCountsResponse = z.infer<
	typeof projectStatusCountsResponseSchema
>;

export const projectOwnerSchema = z.object({
	id: z.string(),
	name: z.string(),
});

export type ProjectOwner = z.infer<typeof projectOwnerSchema>;

export const projectOwnerListResponseSchema = apiResponseSchema(
	z.array(projectOwnerSchema),
);

/**
 * Parametros tecnicos da edificacao. Espelham os enums do back
 * (`BuildingCategory`, `SupplyVoltage`, `ConnectionType`, `EntranceStandard`):
 * atravessam o contrato nos dois sentidos, entao moram aqui e o payload de
 * criacao deriva deles em vez de redeclarar `string`.
 */
export const buildingCategorySchema = z.enum([
	"RESIDENTIAL_MULTIFAMILY",
	"NON_RESIDENTIAL",
	"MIXED",
]);

export type BuildingCategory = z.infer<typeof buildingCategorySchema>;

export const supplyVoltageSchema = z.enum(["V220_127", "V380_220"]);

export type SupplyVoltage = z.infer<typeof supplyVoltageSchema>;

export const connectionTypeSchema = z.enum([
	"SINGLE_PHASE",
	"TWO_PHASE",
	"THREE_PHASE",
]);

export type ConnectionType = z.infer<typeof connectionTypeSchema>;

export const entranceStandardSchema = z.enum(["COLLECTIVE", "INDIVIDUAL"]);

export type EntranceStandard = z.infer<typeof entranceStandardSchema>;

export const standardSchema = z.object({
	name: z.string(),
	revision: z.string(),
});

export type Standard = z.infer<typeof standardSchema>;

export const demandRuleSchema = z.object({
	component: z.string(),
	symbol: z.string(),
	method: z.string(),
	prescribedBy: z.string(),
	methodFrom: z.string(),
});

export type DemandRule = z.infer<typeof demandRuleSchema>;

/** `POST /projects` e `GET /projects/{id}` — o projeto com as normas aplicadas. */
export const projectDetailSchema = z.object({
	id: z.string(),
	name: z.string(),
	address: z.string(),
	municipality: z.string(),
	state: brazilianStateSchema,
	postalCode: z.string().nullable(),
	protocol: z.string(),
	status: projectStatusSchema,
	createdAt: z.iso.datetime({ offset: true }),
	updatedAt: z.iso.datetime({ offset: true }),
	submittedAt: z.iso.datetime({ offset: true }).nullish(),
	ownerId: z.string().nullish(),
	ownerName: z.string().nullish(),
	reviewerName: z.string().nullish(),
	reviewedAt: z.iso.datetime({ offset: true }).nullish(),
	reviewCycle: z.number().int().nonnegative(),
	reviewOpinion: z.string().nullable(),
	changeSummary: z.string().nullable(),
	technicalResponsible: z
		.object({ name: z.string(), crea: z.string() })
		.nullish(),
	buildingType: buildingCategorySchema,
	floors: z.number().int().positive(),
	voltage: supplyVoltageSchema,
	connectionType: connectionTypeSchema,
	entranceStandard: entranceStandardSchema,
	standards: z.array(standardSchema),
	applicableStandards: z.string(),
	demandRules: z.array(demandRuleSchema),
});

export type ProjectDetail = z.infer<typeof projectDetailSchema>;

export const projectDetailResponseSchema =
	apiResponseSchema(projectDetailSchema);

export type ProjectDetailResponse = z.infer<typeof projectDetailResponseSchema>;
