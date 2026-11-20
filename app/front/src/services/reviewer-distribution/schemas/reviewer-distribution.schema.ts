import { apiResponseSchema } from "@features/shared";
import { brazilianStateSchema } from "@services/locations";
import { z } from "zod";

export const reviewerMunicipalitySchema = z.object({
	state: brazilianStateSchema,
	municipality: z.string(),
});

export type ReviewerMunicipality = z.infer<typeof reviewerMunicipalitySchema>;

/** An active analyst (`reviewer` or `admin`) and the municipalities routed to them. */
export const reviewerDistributionSchema = z.object({
	reviewer: z.object({ id: z.string(), name: z.string() }),
	municipalities: z.array(reviewerMunicipalitySchema),
});

export type ReviewerDistribution = z.infer<typeof reviewerDistributionSchema>;

export const reviewerDistributionListResponseSchema = apiResponseSchema(
	z.array(reviewerDistributionSchema),
);

export type ReviewerDistributionListResponse = z.infer<
	typeof reviewerDistributionListResponseSchema
>;

export const reviewerMunicipalityListResponseSchema = apiResponseSchema(
	z.array(reviewerMunicipalitySchema),
);
