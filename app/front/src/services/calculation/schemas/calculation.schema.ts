import { apiResponseSchema } from "@features/shared";
import { z } from "zod";

export const demandCodeSchema = z.enum(["Drf", "Ds", "Dc", "Dve", "Ded"]);

export type DemandCode = z.infer<typeof demandCodeSchema>;

export const checkStatusSchema = z.enum([
	"PASSED",
	"INFO",
	"WARNING",
	"SKIPPED",
]);

export type CheckStatus = z.infer<typeof checkStatusSchema>;

const standardRevisionSchema = z.object({
	name: z.string(),
	revision: z.string(),
});

export const normativeReferenceSchema = z.object({
	label: z.string(),
	identification: z.string(),
	standard: z.string(),
	revision: z.string(),
	item: z.string(),
	page: z.string(),
});

export type NormativeReference = z.infer<typeof normativeReferenceSchema>;

export const calculationStepSchema = z.object({
	index: z.number().int(),
	code: demandCodeSchema,
	title: z.string(),
	applies: z.boolean(),
	formula: z.string(),
	details: z.array(z.string()),
	valueKva: z.number(),
	reference: normativeReferenceSchema.nullable(),
});

export type CalculationStep = z.infer<typeof calculationStepSchema>;

export const calculationSchema = z.object({
	id: z.string(),
	projectId: z.string(),
	calculatedAt: z.iso.datetime({ offset: true }),
	standards: z.object({
		main: standardRevisionSchema.nullable(),
		secondary: standardRevisionSchema.nullable(),
	}),
	steps: z.array(calculationStepSchema),
	totals: z.object({
		calculatedKva: z.number(),
		minimumKva: z.number(),
		finalKva: z.number(),
		minimumApplied: z.boolean(),
	}),
	traceability: z.object({
		voltage: z.string(),
		connectionType: z.string(),
		entranceStandard: z.string(),
		currentAmps: z.number(),
		serviceEntranceBand: z.string(),
		circuits: z.number().int(),
		cableSectionMm2: z.number(),
		breakerAmps: z.number(),
		breakerPoles: z.string(),
	}),
	composition: z.array(
		z.object({
			code: demandCodeSchema,
			valueKva: z.number(),
			percent: z.number(),
		}),
	),
	checks: z.array(
		z.object({
			code: z.string(),
			status: checkStatusSchema,
			message: z.string(),
		}),
	),
	checksCount: z.number().int(),
	warningsCount: z.number().int(),
	appliedTables: z.array(
		z.object({
			identification: z.string(),
			standard: z.string(),
			revision: z.string(),
			item: z.string(),
			page: z.string(),
		}),
	),
});

export type Calculation = z.infer<typeof calculationSchema>;

/** `POST` and `GET /projects/{id}/calculation`. */
export const calculationResponseSchema = apiResponseSchema(calculationSchema);

export type CalculationResponse = z.infer<typeof calculationResponseSchema>;
