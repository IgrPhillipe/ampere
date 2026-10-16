import type { Finding } from "@services/project-review";
import { useState } from "react";

import { toFindingFormValues } from "../../components/FindingsPanel/finding-form";
import type { FindingFormValues } from "../../schemas";
import type { FindingEditor } from "../../types";

/** Which finding the side form holds; a new `key` remounts the form with fresh values. */
export const useFindingEditor = () => {
	const [editor, setEditor] = useState<FindingEditor>({
		mode: "create",
		key: 0,
		values: {},
	});
	const [autoFocus, setAutoFocus] = useState(false);

	const start = (values: Partial<FindingFormValues>) => {
		setEditor((current) => ({ mode: "create", key: current.key + 1, values }));
		setAutoFocus(true);
	};

	const edit = (finding: Finding) => {
		setEditor((current) => ({
			mode: "edit",
			key: current.key + 1,
			findingId: finding.id,
			values: toFindingFormValues(finding),
		}));
		setAutoFocus(true);
	};

	const reset = () => {
		setEditor((current) => ({
			mode: "create",
			key: current.key + 1,
			values: {},
		}));
		setAutoFocus(false);
	};

	return { editor, autoFocus, start, edit, reset };
};
