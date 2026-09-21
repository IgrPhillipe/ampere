import { numberFieldSchema, textFieldSchema } from "@features/shared";
import { z } from "zod";

export const projectCreationSchema = z.object({
	name: textFieldSchema.max(120, {
		error: "O nome deve ter no máximo 120 caracteres.",
	}),

	address: textFieldSchema.max(200, {
		error: "O endereço deve ter no máximo 200 caracteres.",
	}),

	municipality: textFieldSchema.max(100, {
		error: "O município deve ter no máximo 100 caracteres.",
	}),

	floors: z.preprocess(
		(value) => (value === "" ? undefined : Number(value)),
		numberFieldSchema
			.int({
				error: "O número de pavimentos deve ser um número inteiro.",
			})
			.min(1, {
				error: "O número de pavimentos deve ser no mínimo 1.",
			})
			.max(200, {
				error: "O número de pavimentos deve ser no máximo 200.",
			}),
	),

	buildingType: z.enum(
		["RESIDENTIAL_MULTIFAMILY", "NON_RESIDENTIAL", "MIXED"],
		{
			error: "O tipo de edificação é obrigatório.",
		},
	),

	voltage: z.enum(["V220_127", "V380_220"], {
		error: "A tensão de fornecimento é obrigatória.",
	}),

	connectionType: z.enum(["SINGLE_PHASE", "TWO_PHASE", "THREE_PHASE"], {
		error: "O tipo de ligação é obrigatório.",
	}),

	entranceStandard: z.enum(["COLLECTIVE", "INDIVIDUAL"], {
		error: "O padrão de entrada é obrigatório.",
	}),
});

export type ProjectCreationFormValues = z.infer<typeof projectCreationSchema>;
