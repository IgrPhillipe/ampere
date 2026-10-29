import { authHandlers } from "@services/auth/mocks/handlers";
import { projectHandlers } from "@services/projects/mocks/handlers";
import { userHandlers } from "@services/users/mocks/handlers";

export const handlers = [...authHandlers, ...projectHandlers, ...userHandlers];
