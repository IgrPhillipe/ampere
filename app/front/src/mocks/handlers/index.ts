import { authHandlers } from "@services/auth/mocks/handlers";
import { exampleHandlers } from "@services/example/mocks/handlers";

export const handlers = [...authHandlers, ...exampleHandlers];
