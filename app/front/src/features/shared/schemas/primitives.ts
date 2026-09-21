import { z } from "zod";

import { REQUIRED_EMAIL, REQUIRED_ERROR } from "./constants";

export const emailSchema = z
	.string({ error: REQUIRED_ERROR })
	.trim()
	.toLowerCase()
	.email({ error: REQUIRED_EMAIL });

export const textFieldSchema = z
	.string({ error: REQUIRED_ERROR })
	.trim()
	.min(1, { error: REQUIRED_ERROR });

/**
 * Campo numerico obrigatorio. O `undefined` de um input vazio cai no
 * `REQUIRED_ERROR` em vez da mensagem crua do Zod para tipo invalido.
 */
export const numberFieldSchema = z.number({ error: REQUIRED_ERROR });
