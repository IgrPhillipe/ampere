import { useWorkspaceReviewing } from "../ProjectWorkspace";

/** `panel` sits beside the data; `strip` is the summary above it, in the analyst's view. */
export type StepPanelLayout = "panel" | "strip";

/** The stage panel's layout for whoever is viewing the project. */
export const useStepPanelLayout = (): StepPanelLayout =>
	useWorkspaceReviewing() ? "strip" : "panel";
