import { EmptyState } from "@components/EmptyState";
import { PageLayout } from "@components/layout";
import { Button } from "@components/ui/button";
import {
	type Project,
	type ProjectStatusCounts,
	useGetProjectList,
	useGetProjectStatusCounts,
} from "@services/projects";
import { ArrowRight, CircleAlert } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";

import {
	ProjectFilters,
	ProjectPagination,
	ProjectsTable,
} from "../../components";
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
	const {
		status,
		search,
		debouncedSearch,
		page,
		setStatus,
		setSearch,
		setPage,
	} = useProjectFilters();
	const projectsQuery = useGetProjectList({
		page,
		pageSize: PAGE_SIZE,
		status: status === "ALL" ? undefined : status,
		search: debouncedSearch || undefined,
	});
	// Contadores em query própria: são globais e não mudam ao paginar nem ao buscar.
	const statusCountsQuery = useGetProjectStatusCounts();

	const projects = projectsQuery.data?.data ?? [];
	const counts = statusCountsQuery.data?.data ?? emptyStatusCounts;
	const pagination = projectsQuery.data?.pagination;

	const handleViewFindings = useCallback((project: Project) => {
		toast.info(
			`Os apontamentos de "${project.name}" serão exibidos na etapa de detalhes do projeto.`,
		);
	}, []);

	const handleResumeSubmission = useCallback((project: Project) => {
		toast.info(
			[
				"A retomada de ",
				project.name,
				" será disponibilizada na etapa de edição do projeto.",
			].join(""),
		);
	}, []);

	return (
		<PageLayout
			title="Meus projetos"
			description="Acompanhe o andamento dos projetos enviados à Neoenergia Pernambuco."
			bleed
			actions={
				<Button type="button" size="sm" className="rounded-xs">
					Novo projeto
					<ArrowRight aria-hidden="true" />
				</Button>
			}
			className="mx-auto min-h-full w-full max-w-page pb-0 md:pb-0"
		>
			<section
				className="flex flex-1 flex-col bg-card"
				aria-label="Listagem de projetos"
			>
				<ProjectFilters
					counts={counts}
					status={status}
					search={search}
					onStatusChange={(value) => void setStatus(value)}
					onSearchChange={(value) => void setSearch(value)}
				/>

				<div className="flex-1 px-gutter py-4 md:px-gutter-md md:py-5">
					{projectsQuery.isError ? (
						<EmptyState
							title="Não foi possível carregar os projetos"
							description="Verifique sua conexão e tente novamente."
							icon={CircleAlert}
							action={
								<Button
									type="button"
									variant="outline"
									onClick={() => void projectsQuery.refetch()}
								>
									Tentar novamente
								</Button>
							}
						/>
					) : (
						<ProjectsTable
							projects={projects}
							isLoading={projectsQuery.isPending}
							onViewFindings={handleViewFindings}
							onResumeSubmission={handleResumeSubmission}
						/>
					)}
				</div>

				{pagination && !projectsQuery.isError ? (
					<ProjectPagination
						page={pagination.page}
						pageSize={pagination.pageSize}
						total={pagination.total}
						onPageChange={(nextPage) => void setPage(nextPage)}
					/>
				) : null}
			</section>
		</PageLayout>
	);
};
