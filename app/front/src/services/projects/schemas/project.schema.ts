import { apiResponseSchema, paginatedResponseSchema } from "@features/shared";
import { z } from "zod";

export const projectStatusSchema = z.enum([
	"DRAFT",
	"AWAITING_SUBMISSION",
	"UNDER_REVIEW",
	"REJECTED",
	"APPROVED",
]);

export type ProjectStatus = z.infer<typeof projectStatusSchema>;

export const projectSchema = z.object({
	id: z.string(),
	name: z.string(),
	address: z.string(),
	municipality: z.string(),
	protocol: z.string(),
	status: projectStatusSchema,
	createdAt: z.iso.datetime({ offset: true }),
	updatedAt: z.iso.datetime({ offset: true }),
	pendingCount: z.number().int().nonnegative(),
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
	protocol: z.string(),
	status: projectStatusSchema,
	updatedAt: z.iso.datetime({ offset: true }),
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
