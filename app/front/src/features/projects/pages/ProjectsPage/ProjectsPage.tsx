import { EmptyState } from "@components/EmptyState";
import { ListToolbar } from "@components/ListToolbar";
import { PageLayout } from "@components/layout";
import { Pagination } from "@components/Pagination";
import { SearchInput } from "@components/SearchInput";
import { SortMenu, type SortOption } from "@components/SortMenu";
import { Button } from "@components/ui/button";
import { useAuthStore } from "@features/shared";
import {
	type Project,
	type ProjectSort,
	type ProjectStatusCounts,
	useDeleteProject,
	useGetProjectList,
	useGetProjectStatusCounts,
} from "@services/projects";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, CircleAlert } from "lucide-react";
import { useCallback, useState } from "react";

import {
	ProjectActiveFilters,
	ProjectDeleteDialog,
	ProjectFilterControls,
	ProjectStatusFilters,
	ProjectsTable,
} from "../../components";
import { getProjectsPageTitle } from "../../constants";
import { PROJECT_SORT_DIRECTIONS, useProjectFilters } from "../../hooks";

const PAGE_SIZE = 10;

const sortOptions: SortOption<ProjectSort>[] = [
	{ value: "updatedAt", label: "Atualização" },
	{ value: "createdAt", label: "Criação" },
	{ value: "name", label: "Nome" },
	{ value: "demand", label: "Demanda" },
];

const adminSortOptions: SortOption<ProjectSort>[] = [
	...sortOptions,
	{ value: "owner", label: "Projetista" },
];

const emptyStatusCounts: ProjectStatusCounts = {
	total: 0,
	draft: 0,
	awaitingSubmission: 0,
	underReview: 0,
	rejected: 0,
	approved: 0,
};

export const ProjectsPage = () => {
	const navigate = useNavigate();
	const role = useAuthStore((state) => state.user?.role);
	const isAdmin = role === "admin";
	const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
	const deleteProject = useDeleteProject();
	const filters = useProjectFilters();
	const {
		status,
		search,
		sort,
		hasActiveFilters,
		setStatus,
		setSearch,
		setPage,
		setSort,
		sortBy,
		clearFilters,
	} = filters;
	const projectsQuery = useGetProjectList({
		...filters.params,
		pageSize: PAGE_SIZE,
	});
	// Counters get their own query: they are global and change with neither page nor search.
	const statusCountsQuery = useGetProjectStatusCounts();

	const projects = projectsQuery.data?.data ?? [];
	const counts = statusCountsQuery.data?.data ?? emptyStatusCounts;
	const pagination = projectsQuery.data?.pagination;
	const hasError = projectsQuery.isError || statusCountsQuery.isError;

	const handleResumeSubmission = useCallback(
		(project: Project) =>
			void navigate({
				to: "/projetos/$id/documentos",
				params: { id: project.id },
			}),
		[navigate],
	);

	// Resumes at the step the draft stopped: units, then calculation, then documents.
	const handleContinueDraft = useCallback(
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

	const handleViewProject = useCallback(
		(project: Project) =>
			void navigate({ to: "/projetos/$id", params: { id: project.id } }),
		[navigate],
	);

	const handleEditProject = useCallback(
		(project: Project) =>
			void navigate({ to: "/projetos/$id/dados", params: { id: project.id } }),
		[navigate],
	);

	const handleDeleteProject = useCallback((project: Project) => {
		setProjectToDelete(project);
	}, []);

	const confirmProjectDeletion = () => {
		if (!projectToDelete) return;

		deleteProject.mutate(projectToDelete.id, {
			onSuccess: () => setProjectToDelete(null),
		});
	};

	return (
		<PageLayout
			title={getProjectsPageTitle(role)}
			description={
				isAdmin
					? "Todos os projetos dos projetistas, em qualquer situação."
					: "Acompanhe o andamento dos projetos enviados à Neoenergia Pernambuco."
			}
			bleed
			actions={
				<Button
					type="button"
					size="sm"
					onClick={() => void navigate({ to: "/projetos/novo" })}
				>
					Novo Projeto
					<ArrowRight aria-hidden="true" />
				</Button>
			}
			className="mx-auto min-h-full w-full max-w-page pb-0 md:pb-0"
		>
			<section
				className="flex flex-1 flex-col bg-card"
				aria-label="Listagem de projetos"
			>
				<ListToolbar
					filters={
						<ProjectStatusFilters
							counts={counts}
							value={status}
							onValueChange={setStatus}
						/>
					}
					search={
						<SearchInput
							value={search}
							onValueChange={setSearch}
							placeholder="Buscar por nome ou protocolo"
							label="Buscar projetos"
						/>
					}
					sort={
						<SortMenu
							options={isAdmin ? adminSortOptions : sortOptions}
							value={sort}
							directions={PROJECT_SORT_DIRECTIONS}
							onValueChange={setSort}
						/>
					}
					refinements={
						<ProjectFilterControls
							showOwner={isAdmin}
							owner={filters.owner}
							onOwnerChange={filters.setOwner}
							state={filters.state}
							onStateChange={filters.setState}
							municipality={filters.municipality}
							onMunicipalityChange={filters.setMunicipality}
							period={filters.period}
							onPeriodChange={filters.setPeriod}
							findings={filters.findings}
							onFindingsChange={filters.setFindings}
						/>
					}
					activeFilters={<ProjectActiveFilters filters={filters} />}
				/>

				<div className="flex-1 px-gutter py-4 md:px-gutter-md md:py-5">
					{hasError ? (
						<EmptyState
							title="Não foi possível carregar os projetos"
							description="Verifique sua conexão e tente novamente."
							icon={CircleAlert}
							action={
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										void projectsQuery.refetch();
										void statusCountsQuery.refetch();
									}}
								>
									Tentar Novamente
								</Button>
							}
						/>
					) : (
						<ProjectsTable
							projects={projects}
							showOwner={isAdmin}
							isLoading={projectsQuery.isPending}
							onResumeSubmission={handleResumeSubmission}
							onContinueDraft={handleContinueDraft}
							onViewProject={handleViewProject}
							onEditProject={handleEditProject}
							onDeleteProject={handleDeleteProject}
							sort={sort}
							onSortChange={sortBy}
							onClearFilters={hasActiveFilters ? clearFilters : undefined}
						/>
					)}
				</div>

				{pagination && !hasError ? (
					<Pagination
						page={pagination.page}
						pageSize={pagination.pageSize}
						total={pagination.total}
						onPageChange={setPage}
						itemLabel="projetos"
					/>
				) : null}
			</section>

			<ProjectDeleteDialog
				project={projectToDelete}
				isPending={deleteProject.isPending}
				onOpenChange={(open) => {
					if (!open) setProjectToDelete(null);
				}}
				onConfirm={confirmProjectDeletion}
			/>
		</PageLayout>
	);
};
