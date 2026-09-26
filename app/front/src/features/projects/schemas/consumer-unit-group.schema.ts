import { numberFieldSchema, textFieldSchema } from "@features/shared";
import {
	evStationTypeSchema,
	lampTechnologySchema,
	loadCategorySchema,
	loadUsageSchema,
	powerUnitSchema,
} from "@services/consumer-units";
import { z } from "zod";

import { GROUP_USAGE_TYPES, type GroupUsageType } from "../constants";

/**
 * Os formularios so validam a forma do dado, como o `ConsumerUnitGroupRequest`
 * do back. Dado normativo pode ficar vazio: o grupo e salvo e a pendencia
 * aparece no painel de validacao. Por isso quase tudo aqui e opcional.
 */

/** Input numerico vazio entrega `""`; vira `null`, que e "nao informado". */
const optionalNumber = (schema: z.ZodNumber) =>
	z.preprocess(
		(value) => (value === "" || value == null ? null : Number(value)),
		schema.nullable(),
	);

const optionalPositive = (message: string) =>
	optionalNumber(z.number().positive({ error: message }));

/**
 * Select "Sim / Não". Continua string no formulario porque o `ControlledSelect`
 * trata `false` como vazio; vira booleano so no payload (`toBoolean`). `""` e
 * `null`, "nao informado".
 */
const optionalYesNo = z.preprocess(
	(value) => (value === "" || value == null ? null : String(value)),
	z.enum(["true", "false"]).nullable(),
);

export type YesNo = "true" | "false";

export const toBoolean = (value: YesNo | null) =>
	value === null ? null : value === "true";

export const toYesNo = (value: boolean | null | undefined): YesNo | null =>
	value == null ? null : value ? "true" : "false";

const optionalEnum = <T extends z.ZodEnum>(schema: T) =>
	z.preprocess((value) => (value === "" ? null : value), schema.nullable());

const nameSchema = textFieldSchema.max(120, {
	error: "O nome do grupo deve ter no máximo 120 caracteres.",
});

const quantitySchema = z.preprocess(
	(value) => (value === "" ? undefined : Number(value)),
	numberFieldSchema
		.int({ error: "A quantidade deve ser um número inteiro." })
		.min(1, { error: "A quantidade deve ser no mínimo 1." })
		.max(10000, { error: "A quantidade deve ser no máximo 10.000." }),
);

/**
 * A linha de adicao do H3a: nome, tipo de uso, quantidade e carga. Quantidade
 * e carga ficam em colunas estreitas, entao as mensagens delas sao curtas.
 */
export const newGroupSchema = z.object({
	name: nameSchema,
	usageType: z.enum(
		Object.keys(GROUP_USAGE_TYPES) as [GroupUsageType, ...GroupUsageType[]],
		{ error: "Selecione o tipo de uso." },
	),
	quantity: z.preprocess(
		(value) => (value === "" ? undefined : Number(value)),
		z
			.number({ error: "Obrigatória." })
			.int({ error: "Número inteiro." })
			.min(1, { error: "Mínimo 1." })
			.max(10000, { error: "Máximo 10.000." }),
	),
	load: optionalPositive("Maior que zero."),
});

export type NewGroupFormValues = z.infer<typeof newGroupSchema>;

export const residentialGroupFormSchema = z.object({
	name: nameSchema,
	quantity: quantitySchema,
	usefulArea: optionalPositive("A área útil deve ser maior que zero."),
	bedrooms: optionalNumber(
		z
			.number()
			.int({ error: "O número de quartos deve ser inteiro." })
			.min(0, { error: "O número de quartos não pode ser negativo." })
			.max(50, { error: "O número de quartos deve ser no máximo 50." }),
	),
	unitLoadKw: optionalPositive("A carga por unidade deve ser maior que zero."),
	compactUnit: optionalYesNo,
});

export type ResidentialGroupFormValues = z.infer<
	typeof residentialGroupFormSchema
>;

export const loadItemFormSchema = z.object({
	category: z.enum(loadCategorySchema.options, {
		error: "Selecione a parcela da carga.",
	}),
	description: textFieldSchema.max(120, {
		error: "A descrição deve ter no máximo 120 caracteres.",
	}),
	quantity: quantitySchema,
	power: optionalPositive("A potência deve ser maior que zero."),
	powerUnit: z.enum(powerUnitSchema.options, {
		error: "Selecione a unidade.",
	}),
	lampTechnology: optionalEnum(lampTechnologySchema),
	simultaneousStart: optionalYesNo,
});

export type LoadItemFormValues = z.infer<typeof loadItemFormSchema>;

export const loadGroupFormSchema = z.object({
	name: nameSchema,
	quantity: quantitySchema,
	usage: optionalEnum(loadUsageSchema),
	items: z
		.array(loadItemFormSchema)
		.max(100, { error: "Informe no máximo 100 cargas por grupo." }),
});

export type LoadGroupFormValues = z.infer<typeof loadGroupFormSchema>;

export const evChargingGroupFormSchema = z.object({
	name: nameSchema,
	quantity: quantitySchema,
	powerPerPointKw: optionalPositive(
		"A potência por ponto deve ser maior que zero.",
	),
	incorporatedInVehicle: optionalYesNo,
	loadManagement: optionalYesNo,
	stationType: optionalEnum(evStationTypeSchema),
});

export type EvChargingGroupFormValues = z.infer<
	typeof evChargingGroupFormSchema
>;
