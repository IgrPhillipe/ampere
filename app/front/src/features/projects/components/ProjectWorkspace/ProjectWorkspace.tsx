import { Breadcrumb, type BreadcrumbItem } from "@components/Breadcrumb";
import { EmptyState } from "@components/EmptyState";
import { PageLayout } from "@components/layout";
import { Button } from "@components/ui/button";
import { Skeleton } from "@components/ui/skeleton";
import { formatDate, padCount, useAuthStore } from "@features/shared";
import { cn } from "@lib/utils";
import { useDeleteProject } from "@services/projects";
import { useSubmitProject } from "@services/submission";
import {
	Link,
	Outlet,
	useMatchRoute,
	useNavigate,
} from "@tanstack/react-router";
import { CircleAlert, Lock, RotateCcw, Send, Trash2 } from "lucide-react";
import { type ReactNode, useState } from "react";

import {
	getProjectsPageTitle,
	PROJECT_SECTIONS,
	type ProjectSectionKey,
} from "../../constants";
import { useProjectDetailActions, useProjectWorkspace } from "../../hooks";
import { ChangeSummaryNotice } from "../ChangeSummaryNotice";
import { ProjectDeleteDialog } from "../ProjectDeleteDialog";
import { type HeaderMetric, ProjectDetailHeader } from "../ProjectDetailHeader";
import {
	ProjectSectionNav,
	type ProjectSectionState,
} from "../ProjectSectionNav";
import {
	type FindingRegistrar,
	ProjectWorkspaceContext,
} from "./workspace-context";

const submitHintId = "envio-pendencias";

/** The overview path also matches every section below it, so it is the fallback. */
const useCurrentSection = (projectId: string) => {
	const matchRoute = useMatchRoute();
	const [overview, ...sections] = PROJECT_SECTIONS;

	return (
		sections.find(({ to }) => matchRoute({ to, params: { id: projectId } })) ??
		overview
	);
};

interface ProjectWorkspaceProps {
	projectId: string;
	/** The analyst's view: their breadcrumb, notices and side panel replace the designer's, and the change summary shows. */
	reviewing?: boolean;
	breadcrumbRoot?: BreadcrumbItem;
	actions?: ReactNode;
	notices?: ReactNode;
	metrics?: HeaderMetric[];
	/** Overrides the findings counted on each section. */
	attention?: Partial<Record<ProjectSectionKey, number>>;
	aside?: ReactNode;
	footer?: ReactNode;
	registrar?: FindingRegistrar;
	/** Dialogs and sheets owned by whoever wraps the workspace. */
	children?: ReactNode;
}

/** One page per project: the header and the sections stay, only the section below changes. */
export const ProjectWorkspace = ({
	projectId,
	reviewing = false,
	breadcrumbRoot,
	actions,
	notices,
	metrics,
	attention,
	aside,
	footer,
	registrar = {},
	children,
}: ProjectWorkspaceProps) => {
	const navigate = useNavigate();
	const role = useAuthStore((state) => state.user?.role);
	const workspace = useProjectWorkspace(projectId);
	const { project, projectQuery, permissions, checklist } = workspace;
	const current = useCurrentSection(projectId);
	const submitMutation = useSubmitProject();
	const deleteMutation = useDeleteProject({
		onDeleted: () => navigate({ to: "/projetos", replace: true }),
	});
	const [deleting, setDeleting] = useState(false);
	const detailActions = useProjectDetailActions({
		status: project?.status,
		ownerId: project?.ownerId,
	});

	const root = breadcrumbRoot ?? {
		label: getProjectsPageTitle(role),
		to: "/projetos",
	};
	const reanalysis =
		project?.status === "UNDER_REVIEW" && project.reviewCycle > 1;
	const sections: Partial<Record<ProjectSectionKey, ProjectSectionState>> =
		attention
			? Object.fromEntries(
					Object.entries(workspace.sections).map(([key, state]) => [
						key,
						{ ...state, attention: attention[key as ProjectSectionKey] },
					]),
				)
			: workspace.sections;

	const designerMetrics: HeaderMetric[] =
		project && project.reviewCycle > 0
			? [
					{
						label: "Apontamentos em aberto",
						value: padCount(project.openFindingsCount),
					},
				]
			: [];

	const notSent =
		project?.status === "DRAFT" || project?.status === "AWAITING_SUBMISSION";
	const canSubmit = checklist?.canSubmit ?? false;
	const submit = () =>
		submitMutation.mutate(
			{ projectId },
			{
				onSuccess: () =>
					void navigate({ to: "/projetos/$id", params: { id: projectId } }),
			},
		);

	const deleteAction =
		!reviewing && permissions.canDelete ? (
			<Button
				type="button"
				variant="destructive-ghost"
				onClick={() => setDeleting(true)}
			>
				<Trash2 aria-hidden="true" />
				Excluir Projeto
			</Button>
		) : null;

	const submitAction =
		permissions.isOwner && notSent ? (
			<div className="flex flex-col gap-1.5 lg:items-end">
				<Button
					type="button"
					disabled={!canSubmit || submitMutation.isPending}
					aria-describedby={canSubmit ? undefined : submitHintId}
					onClick={submit}
				>
					<Send aria-hidden="true" />
					{submitMutation.isPending ? "Enviando..." : "Enviar para Análise"}
				</Button>
				{canSubmit ? null : (
					<p id={submitHintId} className="text-xs text-muted-foreground">
						Conclua as seções marcadas para enviar.
					</p>
				)}
			</div>
		) : detailActions.resubmit ? (
			<Button
				nativeButton={false}
				render={
					<Link to="/projetos/$id" params={{ id: projectId }} hash="reenvio" />
				}
			>
				<RotateCcw aria-hidden="true" />
				Reenviar Projeto
			</Button>
		) : null;

	const designerActions =
		deleteAction || submitAction ? (
			<>
				{deleteAction}
				{submitAction}
			</>
		) : null;

	if (projectQuery.isError) {
		return (
			<PageLayout bleed className="mx-auto w-full max-w-page">
				<div className="px-6 md:px-8">
					<EmptyState
						title="Não foi possível abrir o projeto"
						description="Confira o aviso exibido e tente novamente."
						icon={CircleAlert}
						action={
							<div className="flex gap-2">
								<Button
									type="button"
									variant="ghost"
									onClick={() => void navigate({ to: root.to })}
								>
									Voltar para {root.label}
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={() => void projectQuery.refetch()}
								>
									Tentar Novamente
								</Button>
							</div>
						}
					/>
				</div>
			</PageLayout>
		);
	}

	const breadcrumb: BreadcrumbItem[] = [root];
	if (project) {
		const isOverview = current.key === "overview";
		breadcrumb.push(
			isOverview
				? { label: project.name }
				: {
						label: project.name,
						to: "/projetos/$id",
						params: { id: projectId },
					},
		);
		if (!isOverview) breadcrumb.push({ label: current.label });
	}

	return (
		<ProjectWorkspaceContext value={{ reviewing, registrar }}>
			<PageLayout
				bleed
				className="mx-auto min-h-full w-full max-w-page pb-0 md:pb-0"
			>
				<div className="flex flex-1 flex-col bg-card">
					<ProjectDetailHeader
						breadcrumb={<Breadcrumb items={breadcrumb} />}
						project={project}
						isLoading={projectQuery.isPending}
						reanalysis={reanalysis}
						correcting={detailActions.resubmit}
						metrics={reviewing ? metrics : (metrics ?? designerMetrics)}
						actions={reviewing ? actions : (actions ?? designerActions)}
					/>

					{!reviewing && project?.status === "UNDER_REVIEW" ? (
						<p
							role="status"
							className="flex items-center gap-3 border-b border-border px-6 py-3 text-sm md:px-8"
						>
							<Lock aria-hidden="true" className="size-4 shrink-0" />
							<span>
								{project.submittedAt ? (
									<>
										Enviado em{" "}
										<time dateTime={project.submittedAt}>
											{formatDate(project.submittedAt)}
										</time>
										.{" "}
									</>
								) : null}
								Os dados ficam bloqueados até o parecer do analista.
							</span>
						</p>
					) : null}
					{notices}
					{reviewing && reanalysis && project.changeSummary ? (
						<ChangeSummaryNotice
							version={project.reviewCycle}
							summary={project.changeSummary}
						/>
					) : null}

					<ProjectSectionNav projectId={projectId} sections={sections} />

					<div
						className={cn(
							"flex flex-1 flex-col",
							aside && "lg:grid lg:grid-cols-[minmax(0,1fr)_400px]",
						)}
					>
						<div className="@container flex min-w-0 flex-1 flex-col">
							{/* The analyst's workspace replaces this one once the project loads, so an earlier section would mount twice. */}
							{project ? (
								<Outlet />
							) : (
								<div
									aria-busy="true"
									className="flex flex-col gap-3 px-6 py-8 md:px-8"
								>
									<Skeleton className="h-6 w-48" />
									<Skeleton className="h-40 w-full" />
								</div>
							)}
						</div>

						{aside ? (
							<div className="border-t border-border lg:border-t-0 lg:border-l">
								{aside}
							</div>
						) : null}
					</div>

					{footer}
				</div>
			</PageLayout>

			{children}
			<ProjectDeleteDialog
				project={deleting && project ? project : null}
				isPending={deleteMutation.isPending}
				onOpenChange={setDeleting}
				onConfirm={() => deleteMutation.mutate(projectId)}
			/>
		</ProjectWorkspaceContext>
	);
};
