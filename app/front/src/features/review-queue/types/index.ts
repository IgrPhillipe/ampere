import type { FindingStage } from "@services/project-review";

import type { FindingFormValues } from "../schemas";

export type FindingEditor =
	| { mode: "create"; key: number; values: Partial<FindingFormValues> }
	| {
			mode: "edit";
			key: number;
			findingId: string;
			values: FindingFormValues;
	  };

export type FindingReferenceOptions = Record<
	FindingStage,
	Record<string, string>
>;
