import { authHandlers } from "@services/auth/mocks/handlers";
import { projectReviewHandlers } from "@services/project-review/mocks/handlers";
import { projectHandlers } from "@services/projects/mocks/handlers";

export const handlers = [
	...authHandlers,
	...projectHandlers,
	...projectReviewHandlers,
];
