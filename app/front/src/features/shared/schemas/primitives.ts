import { z } from "zod";

import { isValidCNPJ, isValidCPF } from "@/features/shared/utils/regex";

import {
	REQUIRED_CEP,
	REQUIRED_CNPJ,
	REQUIRED_CPF,
	REQUIRED_CPF_CNPJ,
	REQUIRED_EMAIL,
	REQUIRED_ERROR,
	REQUIRED_NUMBER,
	REQUIRED_PHONE,
	REQUIRED_RG,
	REQUIRED_URL,
} from "./constants";

export const urlSchema = z
	.string({ error: REQUIRED_ERROR })
	.trim()
	.url({ error: REQUIRED_URL });

export const emailSchema = z
	.string({ error: REQUIRED_ERROR })
	.trim()
	.toLowerCase()
	.email({ error: REQUIRED_EMAIL });

export const textFieldSchema = z
	.string({ error: REQUIRED_ERROR })
	.trim()
	.min(1, { error: REQUIRED_ERROR });

export const optionalTextFieldSchema = z
	.string()
	.trim()
	.transform((v) => (v === "" ? undefined : v))
	.optional();

export const rgSchema = z
	.string({ error: REQUIRED_ERROR })
	.trim()
	.transform((v) => v.replace(/[^\d]/g, ""))
	.pipe(z.string().length(8, { error: REQUIRED_RG }));

export const cpfSchema = z
	.string({ error: REQUIRED_ERROR })
	.trim()
	.refine((cpf) => isValidCPF(cpf), { error: REQUIRED_CPF });

export const cnpjSchema = z
	.string({ error: REQUIRED_ERROR })
	.trim()
	.refine((cnpj) => isValidCNPJ(cnpj), { error: REQUIRED_CNPJ });

export const cpfCnpjSchema = z
	.string({ error: REQUIRED_ERROR })
	.trim()
	.refine(
		(value) => {
			const clean = value.replace(/[^\d]/g, "");
			if (clean.length === 11) return isValidCPF(value);
			if (clean.length === 14) return isValidCNPJ(value);
			return false;
		},
		{ error: REQUIRED_CPF_CNPJ },
	);

export const cepSchema = z
	.string({ error: REQUIRED_ERROR })
	.trim()
	.refine((value) => value.replace(/[^\d]/g, "").length === 8, {
		error: REQUIRED_CEP,
	});

export const phoneSchema = z
	.string({ error: REQUIRED_ERROR })
	.trim()
	.refine(
		(value) => {
			const clean = value.replace(/[^\d]/g, "");
			return clean.length >= 10 && clean.length <= 11;
		},
		{ error: REQUIRED_PHONE },
	);

export const dateFieldSchema = z.date({ error: REQUIRED_ERROR });

export const numberFieldSchema = z.number({ error: REQUIRED_ERROR });

export const integerFieldSchema = z
	.number({ error: REQUIRED_ERROR })
	.int({ error: REQUIRED_NUMBER });

export const optionalNumberFieldSchema = z
	.number({ error: REQUIRED_ERROR })
	.optional();

export const optionalIntegerFieldSchema = z
	.number({ error: REQUIRED_ERROR })
	.int({ error: REQUIRED_NUMBER })
	.optional();
