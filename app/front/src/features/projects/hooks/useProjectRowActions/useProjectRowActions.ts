import { type Project, useDeleteProject } from "@services/projects";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";

import type { ProjectRowActions } from "../../components/ProjectsTable/project-row";

/** What a project row does, shared by every listing that shows `ProjectsTable`. */
export const useProjectRowActions = () => {
	const navigate = useNavigate();
	const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
	const deleteProject = useDeleteProject();

	const onResumeSubmission = useCallback(
		(project: Project) =>
			void navigate({
				to: "/projetos/$id/documentos",
				params: { id: project.id },
			}),
		[navigate],
	);

	// Resumes at the step the draft stopped: units, then calculation, then documents.
	const onContinueDraft = useCallback(
		(project: Project) => {
			const to =
				project.consumerUnitsCount === 0
					? "/projetos/$id/unidades"
					: project.demandKva === null
						? "/projetos/$id/calculo"
						: "/projetos/$id/documentos";

			void navigate({ to, params: { id: project.id } });
		},
		[navigate],
	);

	const onViewProject = useCallback(
		(project: Project) =>
			void navigate({ to: "/projetos/$id", params: { id: project.id } }),
		[navigate],
	);

	const onEditProject = useCallback(
		(project: Project) =>
			void navigate({ to: "/projetos/$id/dados", params: { id: project.id } }),
		[navigate],
	);

	const actions = useMemo<ProjectRowActions>(
		() => ({
			onResumeSubmission,
			onContinueDraft,
			onViewProject,
			onEditProject,
			onDeleteProject: setProjectToDelete,
		}),
		[onResumeSubmission, onContinueDraft, onViewProject, onEditProject],
	);

	const deleteDialog = {
		project: projectToDelete,
		isPending: deleteProject.isPending,
		onOpenChange: (open: boolean) => {
			if (!open) setProjectToDelete(null);
		},
		onConfirm: () => {
			if (!projectToDelete) return;

			deleteProject.mutate(projectToDelete.id, {
				onSuccess: () => setProjectToDelete(null),
			});
		},
	};

	return { actions, deleteDialog };
};
