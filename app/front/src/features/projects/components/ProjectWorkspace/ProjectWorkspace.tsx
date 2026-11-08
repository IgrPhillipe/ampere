import { Breadcrumb, type BreadcrumbItem } from "@components/Breadcrumb";
import { EmptyState } from "@components/EmptyState";
import { PageLayout } from "@components/layout";
import { Button } from "@components/ui/button";
import { Skeleton } from "@components/ui/skeleton";
import { formatDate, padCount, useAuthStore } from "@features/shared";
import { cn } from "@lib/utils";
import { useDeleteProject } from "@services/projects";
import { useSubmitProject } from "@services/submission";
import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { ArrowRight, CircleAlert, Lock } from "lucide-react";
import { type ReactNode, useState } from "react";

import { getProjectsPageTitle, type ProjectSectionKey } from "../../constants";
import {
	useCurrentSection,
	useProjectDetailActions,
	useProjectWorkspace,
} from "../../hooks";
import { ChangeSummaryNotice } from "../ChangeSummaryNotice";
import { ProjectDeleteDialog } from "../ProjectDeleteDialog";
import { ProjectDetailFooter } from "../ProjectDetailFooter";
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

const STEP_SECTIONS: ProjectSectionKey[] = [
	"data",
	"units",
	"calculation",
	"memorial",
	"documents",
];

/** Steps that close with their own footer; the others take the submission in the workspace's. */
const STEPS_WITH_FOOTER: ProjectSectionKey[] = [
	"data",
	"units",
	"calculation",
	"memorial",
];

/** On the history the side panel would squeeze the timeline, so it goes below. */
export type AsidePlacement = "side" | "below";

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
	aside?: (section: ProjectSectionKey, placement: AsidePlacement) => ReactNode;
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
	const current = useCurrentSection();
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
					void navigate({
						to: "/projetos/$id/envio",
						params: { id: projectId },
					}),
			},
		);

	const deleteAction =
		!reviewing && permissions.canDelete ? (
			<Button
				type="button"
				variant="destructive-ghost"
				className="h-auto px-0"
				onClick={() => setDeleting(true)}
			>
				Excluir Projeto
			</Button>
		) : null;

	const canSendHere = permissions.isOwner && notSent;
	const submitInFooter =
		canSendHere && !STEPS_WITH_FOOTER.includes(current.key);
	const submitButton = (variant: "default" | "link") => (
		<Button
			type="button"
			variant={variant}
			className={variant === "link" ? "h-auto px-0" : undefined}
			disabled={!canSubmit || submitMutation.isPending}
			aria-describedby={canSubmit ? undefined : submitHintId}
			onClick={submit}
		>
			{submitMutation.isPending ? "Enviando..." : "Enviar para Análise"}
			<ArrowRight aria-hidden="true" />
		</Button>
	);
	const submitHint = canSubmit ? null : (
		<p
			id={submitHintId}
			className="flex items-center gap-2 text-sm text-foreground"
		>
			<span
				aria-hidden="true"
				className="size-1.5 shrink-0 rounded-full bg-attention"
			/>
			Conclua as seções marcadas para enviar.
		</p>
	);

	// The step's own footer holds its primary, so the submission stays a text link up here.
	const submitAction =
		canSendHere && !submitInFooter ? (
			<div className="flex flex-col gap-1.5 lg:items-end">
				{submitButton("link")}
				{submitHint}
			</div>
		) : detailActions.resubmit ? (
			<Button
				variant="link"
				className="h-auto px-0"
				nativeButton={false}
				render={
					<Link to="/projetos/$id" params={{ id: projectId }} hash="reenvio" />
				}
			>
				Reenviar Projeto
				<ArrowRight aria-hidden="true" />
			</Button>
		) : null;

	const submitFooter = submitInFooter ? (
		<ProjectDetailFooter
			summary={submitHint}
			className="border-t border-border"
		>
			{submitButton("default")}
		</ProjectDetailFooter>
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
				<div className="px-6 md:px-10">
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

	// The name is the title right below, so the trail names only the open section.
	const breadcrumb: BreadcrumbItem[] = [
		root,
		{
			label: STEP_SECTIONS.includes(current.key)
				? `Etapa ${current.index}: ${current.label}`
				: current.label,
		},
	];
	const placement: AsidePlacement =
		current.key === "history" ? "below" : "side";
	const asideContent = aside?.(current.key, placement) ?? null;

	return (
		<ProjectWorkspaceContext value={{ reviewing, registrar }}>
			<PageLayout
				bleed
				className="mx-auto min-h-full w-full max-w-page py-0 md:py-0"
			>
				<div className="flex flex-1 flex-col bg-card">
					<ProjectDetailHeader
						breadcrumb={<Breadcrumb items={breadcrumb} />}
						project={project}
						isLoading={projectQuery.isPending}
						reanalysis={reanalysis}
						reviewing={reviewing}
						correcting={detailActions.resubmit}
						metrics={reviewing ? metrics : (metrics ?? designerMetrics)}
						actions={reviewing ? actions : (actions ?? designerActions)}
					/>

					{!reviewing && project?.status === "UNDER_REVIEW" ? (
						<p
							role="status"
							className="flex items-center gap-3 border-b border-border px-6 py-3 text-sm md:px-10"
						>
							<Lock
								aria-hidden="true"
								className="size-4 shrink-0 text-faint-foreground"
							/>
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
							asideContent &&
								placement === "side" &&
								"lg:grid lg:grid-cols-[minmax(0,1fr)_400px]",
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

						{asideContent ? (
							<div
								className={cn(
									"border-t border-border",
									placement === "side" && "lg:border-t-0 lg:border-l",
								)}
							>
								{asideContent}
							</div>
						) : null}
					</div>

					{footer ?? submitFooter}
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
