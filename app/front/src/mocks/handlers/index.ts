import { authHandlers } from "@services/auth/mocks/handlers";
import { consumerUnitGroupHandlers } from "@services/consumer-units/mocks/handlers";
import { projectHandlers } from "@services/projects/mocks/handlers";

export const handlers = [
	...authHandlers,
	...consumerUnitGroupHandlers,
	...projectHandlers,
];
