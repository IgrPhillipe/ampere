import { apiResponseSchema } from "@features/shared";
import { z } from "zod";

export const groupKindSchema = z.enum(["RESIDENTIAL", "LOAD", "EV_CHARGING"]);

export type GroupKind = z.infer<typeof groupKindSchema>;

export const groupStatusSchema = z.enum([
	"VALIDATED",
	"REVIEW",
	"MISSING_DATA",
]);

export type GroupStatus = z.infer<typeof groupStatusSchema>;

export const issueSeveritySchema = z.enum(["REVIEW", "MISSING_DATA"]);

export type IssueSeverity = z.infer<typeof issueSeveritySchema>;

export const loadUsageSchema = z.enum(["COMMON_AREA", "COMMERCIAL"]);

export type LoadUsage = z.infer<typeof loadUsageSchema>;

export const loadCategorySchema = z.enum([
	"LIGHTING_AND_OUTLETS",
	"INSTANT_HEATING",
	"STORAGE_HEATING",
	"APPLIANCES",
	"COOKING",
	"AIR_CONDITIONING",
	"MOTORS",
	"SPECIAL_EQUIPMENT",
	"PUMPS_AND_HOT_TUBS",
]);

export type LoadCategory = z.infer<typeof loadCategorySchema>;

export const lampTechnologySchema = z.enum([
	"FLUORESCENT_NEON_SODIUM",
	"COMPACT_FLUORESCENT_LED",
	"GENERAL_OUTLETS",
]);

export type LampTechnology = z.infer<typeof lampTechnologySchema>;

export const powerUnitSchema = z.enum(["KW", "CV", "HP"]);

export type PowerUnit = z.infer<typeof powerUnitSchema>;

export const evStationTypeSchema = z.enum(["INDIVIDUAL", "COLLECTIVE"]);

export type EvStationType = z.infer<typeof evStationTypeSchema>;

export const validationIssueSchema = z.object({
	severity: issueSeveritySchema,
	field: z.string(),
	message: z.string(),
});

export type ValidationIssue = z.infer<typeof validationIssueSchema>;

export const loadItemSchema = z.object({
	category: loadCategorySchema,
	description: z.string(),
	quantity: z.number().int().positive(),
	power: z.number().positive().nullish(),
	powerUnit: powerUnitSchema,
	lampTechnology: lampTechnologySchema.nullish(),
	simultaneousStart: z.boolean().nullish(),
});

export type LoadItem = z.infer<typeof loadItemSchema>;

/** The back omits fields that were not informed, so every kind field is `nullish`. */
const groupBaseSchema = z.object({
	id: z.string(),
	name: z.string(),
	quantity: z.number().int().positive(),
	status: groupStatusSchema,
	issues: z.array(validationIssueSchema),
	summary: z.string(),
	loadPerUnitKw: z.number().nonnegative().nullish(),
	declaredLoadKw: z.number().nonnegative(),
});

export const residentialGroupSchema = groupBaseSchema.extend({
	kind: z.literal("RESIDENTIAL"),
	usefulArea: z.number().positive().nullish(),
	bedrooms: z.number().int().nonnegative().nullish(),
	unitLoadKw: z.number().positive().nullish(),
	compactUnit: z.boolean().nullish(),
});

export const loadGroupSchema = groupBaseSchema.extend({
	kind: z.literal("LOAD"),
	usage: loadUsageSchema.nullish(),
	items: z.array(loadItemSchema),
});

export const evChargingGroupSchema = groupBaseSchema.extend({
	kind: z.literal("EV_CHARGING"),
	powerPerPointKw: z.number().positive().nullish(),
	incorporatedInVehicle: z.boolean().nullish(),
	loadManagement: z.boolean().nullish(),
	stationType: evStationTypeSchema.nullish(),
});

export const consumerUnitGroupSchema = z.discriminatedUnion("kind", [
	residentialGroupSchema,
	loadGroupSchema,
	evChargingGroupSchema,
]);

export type ConsumerUnitGroup = z.infer<typeof consumerUnitGroupSchema>;

export type ResidentialGroup = z.infer<typeof residentialGroupSchema>;

export type LoadGroup = z.infer<typeof loadGroupSchema>;

export type EvChargingGroup = z.infer<typeof evChargingGroupSchema>;

export const consumerUnitGroupListResponseSchema = apiResponseSchema(
	z.array(consumerUnitGroupSchema),
);

export type ConsumerUnitGroupListResponse = z.infer<
	typeof consumerUnitGroupListResponseSchema
>;

export const consumerUnitGroupResponseSchema = apiResponseSchema(
	consumerUnitGroupSchema,
);

export type ConsumerUnitGroupResponse = z.infer<
	typeof consumerUnitGroupResponseSchema
>;

export const groupValidationSchema = z.object({
	canCalculate: z.boolean(),
	pendingCount: z.number().int().nonnegative(),
	totalGroups: z.number().int().nonnegative(),
	totalUnits: z.number().int().nonnegative(),
	totalDeclaredLoadKw: z.number().nonnegative(),
});

export type GroupValidation = z.infer<typeof groupValidationSchema>;

export const groupValidationResponseSchema = apiResponseSchema(
	groupValidationSchema,
);

export type GroupValidationResponse = z.infer<
	typeof groupValidationResponseSchema
>;
