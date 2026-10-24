import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import type { ProjectDetailTab } from "../../constants";
import {
	type PermissionTarget,
	type ProjectPermissions,
	useProjectPermissions,
} from "../useProjectPermissions";

export type ProjectStep = "dados" | "unidades" | "calculo" | "memorial";

/** Where the detail shows what a closed step would show; the data sit in its header. */
const detailTabOf: Record<ProjectStep, ProjectDetailTab | null> = {
	dados: null,
	unidades: "unidades",
	calculo: "memoria",
	memorial: "memorial",
};

export type StepAccess =
	| { allowed: true }
	| { allowed: false; tab: ProjectDetailTab | null };

/** The steps exist to edit; reading a project happens on its detail. */
export const getStepAccess = (
	step: ProjectStep,
	permissions: ProjectPermissions,
): StepAccess =>
	permissions.canEdit || (step === "memorial" && permissions.canEditDocuments)
		? { allowed: true }
		: { allowed: false, tab: detailTabOf[step] };

/** Sends a project that cannot be edited to its detail, on the matching tab. */
export const useStepAccess = (
	projectId: string | undefined,
	project: PermissionTarget | undefined,
	step: ProjectStep,
) => {
	const navigate = useNavigate();
	const permissions = useProjectPermissions(project);
	const access = project ? getStepAccess(step, permissions) : undefined;
	const redirectTab =
		access && !access.allowed ? (access.tab ?? "") : undefined;

	useEffect(() => {
		if (projectId === undefined || redirectTab === undefined) return;

		void navigate({
			href: redirectTab
				? `/projetos/${projectId}?aba=${redirectTab}`
				: `/projetos/${projectId}`,
			replace: true,
		});
	}, [navigate, projectId, redirectTab]);

	return access;
};
