import { describe, expect, it } from "vitest";

import { resubmissionSchema } from "./resubmission.schema";

describe("resubmissionSchema", () => {
	it("requires a change summary", () => {
		expect(resubmissionSchema.safeParse({ changeSummary: "  " }).success).toBe(
			false,
		);
	});

	it("normalizes a valid change summary", () => {
		expect(
			resubmissionSchema.parse({ changeSummary: "  ART substituída.  " }),
		).toEqual({ changeSummary: "ART substituída." });
	});
});
