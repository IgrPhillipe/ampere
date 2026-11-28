import type { ConsumerUnitGroup } from "@services/consumer-units";
import type { ProjectDocument } from "@services/submission";
import { createContext, useContext } from "react";

import type { CalculationCheck } from "../AutomaticVerification";

/** Lets a section start a finding on one of its items; empty for whoever does not review. */
export interface FindingRegistrar {
	onCheck?: (check: CalculationCheck) => void;
	onGroup?: (group: ConsumerUnitGroup) => void;
	onDocument?: (document: ProjectDocument) => void;
}

interface ProjectWorkspaceContextValue {
	/** The analyst's view: the findings column beside the sections, each stage panel as a summary above its data. */
	reviewing: boolean;
	registrar: FindingRegistrar;
}

export const ProjectWorkspaceContext =
	createContext<ProjectWorkspaceContextValue>({
		reviewing: false,
		registrar: {},
	});

export const useFindingRegistrar = () =>
	useContext(ProjectWorkspaceContext).registrar;

export const useWorkspaceReviewing = () =>
	useContext(ProjectWorkspaceContext).reviewing;
