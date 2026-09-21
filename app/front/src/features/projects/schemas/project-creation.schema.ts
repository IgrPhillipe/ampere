import { numberFieldSchema, textFieldSchema } from "@features/shared";
import {
	buildingCategorySchema,
	connectionTypeSchema,
	entranceStandardSchema,
	supplyVoltageSchema,
} from "@services/projects";
import { z } from "zod";

/**
 * Os oito campos da etapa 01. Espelha o `ProjectRequest` do back, limites
 * inclusive, para o formulario recusar o que a API recusaria.
 *
 * Os enums reaproveitam `.options` dos schemas do service em vez de repetir os
 * literais: aqui muda so a mensagem, nunca o conjunto de valores.
 */
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

	// O input numerico entrega `""` enquanto vazio e string depois; o
	// `preprocess` normaliza antes de o `z.number()` julgar o valor.
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

	buildingType: z.enum(buildingCategorySchema.options, {
		error: "O tipo de edificação é obrigatório.",
	}),

	voltage: z.enum(supplyVoltageSchema.options, {
		error: "A tensão de fornecimento é obrigatória.",
	}),

	connectionType: z.enum(connectionTypeSchema.options, {
		error: "O tipo de ligação é obrigatório.",
	}),

	entranceStandard: z.enum(entranceStandardSchema.options, {
		error: "O padrão de entrada é obrigatório.",
	}),
});

export type ProjectCreationFormValues = z.infer<typeof projectCreationSchema>;
