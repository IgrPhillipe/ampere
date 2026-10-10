import { EmptyState } from "@components/EmptyState";
import { ListToolbar } from "@components/ListToolbar";
import { PageLayout } from "@components/layout";
import { Pagination } from "@components/Pagination";
import { SearchInput } from "@components/SearchInput";
import { SortToggle } from "@components/SortToggle";
import { Button } from "@components/ui/button";
import {
	type Project,
	type ProjectStatusCounts,
	useGetProjectList,
	useGetProjectStatusCounts,
} from "@services/projects";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, CircleAlert } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";

import { ProjectStatusFilters, ProjectsTable } from "../../components";
import { useProjectFilters } from "../../hooks";

const PAGE_SIZE = 10;

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
	const {
		status,
		search,
		debouncedSearch,
		page,
		sort,
		hasActiveFilters,
		setStatus,
		setSearch,
		setPage,
		toggleSort,
		clearFilters,
	} = useProjectFilters();
	const projectsQuery = useGetProjectList({
		page,
		pageSize: PAGE_SIZE,
		status: status ?? undefined,
		search: debouncedSearch || undefined,
		sort,
	});
	// Counters get their own query: they are global and change with neither page nor search.
	const statusCountsQuery = useGetProjectStatusCounts();

	const projects = projectsQuery.data?.data ?? [];
	const counts = statusCountsQuery.data?.data ?? emptyStatusCounts;
	const pagination = projectsQuery.data?.pagination;
	const hasError = projectsQuery.isError || statusCountsQuery.isError;

	const handleViewFindings = useCallback((project: Project) => {
		toast.info(
			`Os apontamentos de "${project.name}" serão exibidos na etapa de detalhes do projeto.`,
		);
	}, []);

	const handleResumeSubmission = useCallback(
		(project: Project) =>
			void navigate({
				to: "/projetos/$id/memorial",
				params: { id: project.id },
			}),
		[navigate],
	);

	// Resumes at the step the draft stopped: units, then calculation, then memorial.
	const handleContinueDraft = useCallback(
		(project: Project) => {
			const to =
				project.consumerUnitsCount === 0
					? "/projetos/$id/unidades"
					: project.demandKva === null
						? "/projetos/$id/calculo"
						: "/projetos/$id/memorial";

			void navigate({ to, params: { id: project.id } });
		},
		[navigate],
	);

	const handleViewProject = useCallback(
		(project: Project) =>
			void navigate({ to: "/projetos/$id/envio", params: { id: project.id } }),
		[navigate],
	);

	return (
		<PageLayout
			title="Meus Projetos"
			description="Acompanhe o andamento dos projetos enviados à Neoenergia Pernambuco."
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
						<SortToggle
							label="Atualização"
							descending={sort === "UPDATED_DESC"}
							onToggle={toggleSort}
						/>
					}
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
							isLoading={projectsQuery.isPending}
							onViewFindings={handleViewFindings}
							onResumeSubmission={handleResumeSubmission}
							onContinueDraft={handleContinueDraft}
							onViewProject={handleViewProject}
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
		</PageLayout>
	);
};
