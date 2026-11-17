import { EmptyState } from "@components/EmptyState";
import { Pagination } from "@components/Pagination";
import { SearchInput } from "@components/SearchInput";
import { SectionHeading } from "@components/SectionHeading";
import { Button } from "@components/ui/button";
import {
	ProjectDeleteDialog,
	ProjectOwnerFilter,
	ProjectsTable,
	useProjectRowActions,
	useSelectedOwnerName,
} from "@features/projects";
import { cn } from "@lib/utils";
import { useGetProjectList } from "@services/projects";
import { CircleAlert } from "lucide-react";
import { useId } from "react";

import { useActiveProjectFilters } from "../../hooks";

const PAGE_SIZE = 10;

interface AdminActiveProjectsSectionProps {
	className?: string;
}

export const AdminActiveProjectsSection = ({
	className,
}: AdminActiveProjectsSectionProps) => {
	const headingId = useId();
	const filters = useActiveProjectFilters();
	const { actions, deleteDialog } = useProjectRowActions();

	const projectsQuery = useGetProjectList({
		...filters.params,
		pageSize: PAGE_SIZE,
	});
	const projects = projectsQuery.data?.data ?? [];
	const pagination = projectsQuery.data?.pagination;
	const ownerName = useSelectedOwnerName(filters.owner, projects);

	return (
		<section
			aria-labelledby={headingId}
			className={cn("flex flex-col gap-4", className)}
		>
			<SectionHeading
				id={headingId}
				meta={pagination ? `${pagination.total} projetos` : undefined}
			>
				Projetos Ativos
			</SectionHeading>

			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<SearchInput
					value={filters.search}
					onValueChange={filters.setSearch}
					placeholder="Buscar por protocolo ou nome"
					label="Buscar projetos ativos por protocolo ou nome"
					className="max-w-md"
				/>
				<ProjectOwnerFilter
					value={filters.owner}
					selectedLabel={ownerName}
					onValueChange={filters.setOwner}
					allLabel="Todos os projetistas"
				/>
			</div>

			{projectsQuery.isError ? (
				<EmptyState
					title="Não foi possível carregar os projetos ativos"
					description="Verifique sua conexão e tente novamente."
					icon={CircleAlert}
					action={
						<Button
							type="button"
							variant="outline"
							onClick={() => void projectsQuery.refetch()}
						>
							Tentar Novamente
						</Button>
					}
				/>
			) : (
				<ProjectsTable
					projects={projects}
					showOwner
					isLoading={projectsQuery.isPending}
					{...actions}
					sort={filters.sort}
					onSortChange={filters.sortBy}
					onClearFilters={
						filters.hasActiveFilters ? filters.clearFilters : undefined
					}
				/>
			)}

			{pagination && !projectsQuery.isError ? (
				<Pagination
					page={pagination.page}
					pageSize={pagination.pageSize}
					total={pagination.total}
					onPageChange={filters.setPage}
					itemLabel="projetos"
				/>
			) : null}

			<ProjectDeleteDialog {...deleteDialog} />
		</section>
	);
};
