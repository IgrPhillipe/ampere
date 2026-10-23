import type { Finding } from "../schemas";
import { MOCK_FINDINGS } from "./fixtures";

export const makeFinding = (overrides: Partial<Finding> = {}): Finding => ({
	...MOCK_FINDINGS[0],
	...overrides,
});

export const makeFindingListResponse = (findings = MOCK_FINDINGS) => ({
	data: findings,
});

export const makeFindingResponse = (finding: Finding) => ({ data: finding });
