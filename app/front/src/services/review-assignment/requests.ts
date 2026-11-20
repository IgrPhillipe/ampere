import { http } from "@lib/http";

import { ReviewAssignmentEndpoints as e } from "./endpoints";
import type { AssignReviewQueuePayload } from "./types";

/** All or nothing: when one project fails, none of them changes. Answers 204. */
export const assignReviewQueue = async (payload: AssignReviewQueuePayload) => {
	await http.put(e.assignment, { json: payload });
};
