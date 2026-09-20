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
