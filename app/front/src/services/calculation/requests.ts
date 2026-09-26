import { http } from "@lib/http";
import { isHTTPError } from "ky";

import { CalculationEndpoints as e } from "./endpoints";
import { calculationResponseSchema } from "./schemas";

/** Null while the project has never been calculated. */
export const getLatestCalculation = async (projectId: string) => {
	try {
		const response = await http.get(e.calculation(projectId)).json<unknown>();

		return calculationResponseSchema.parse(response);
	} catch (error) {
		if (isHTTPError(error) && error.response.status === 404) return null;

		throw error;
	}
};

export const runCalculation = async (projectId: string) => {
	const response = await http.post(e.calculation(projectId)).json<unknown>();

	return calculationResponseSchema.parse(response);
};
