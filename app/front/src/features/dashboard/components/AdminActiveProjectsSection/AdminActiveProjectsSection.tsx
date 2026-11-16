import { EmptyState } from "@components/EmptyState";
import { InfiniteFilterMenu } from "@components/InfiniteFilterMenu";
import { Pagination } from "@components/Pagination";
import { SearchInput } from "@components/SearchInput";
import { SectionHeading } from "@components/SectionHeading";
import { Button } from "@components/ui/button";
import { useDebouncedValue } from "@features/shared";
import {
	ProjectDeleteDialog,
	ProjectsTable,
	useSelectedOwnerName,
} from "@features/projects";
import {
	type Project,
	type ProjectSort,
	type ProjectStatus,
	useDeleteProject,
	useGetProjectList,
	useGetProjectOwnerInfiniteList,
} from "@services/projects";
import { useNavigate } from "@tanstack/react-router";
import { CircleAlert } from "lucide-react";
import { useCallback, useId, useMemo, useState } from "react";

const ACTIVE_STATUSES: ProjectStatus[] = [
	"DRAFT",
	"AWAITING_SUBMISSION",
	"UNDER_REVIEW",
	"REJECTED",
];

const SEARCH_DEBOUNCE_MS = 350;
const PAGE_SIZE = 10;

export const AdminActiveProjectsSection = () => {
	const navigate = useNavigate();
	const headingId = useId();

	const [search, setSearch] = useState("");
	const [owner, setOwner] = useState<string | null>(null);
	const [ownerSearch, setOwnerSearch] = useState("");
	const [page, setPage] = useState(1);
	const [sort, setSort] = useState<{ column: ProjectSort; direction: "ASC" | "DESC" }>({
		column: "updatedAt",
		direction: "DESC",
	});
	const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

	const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);
	const debouncedOwnerSearch = useDebouncedValue(ownerSearch.trim(), SEARCH_DEBOUNCE_MS);

	const projectsQuery = useGetProjectList({
		status: ACTIVE_STATUSES,
		search: debouncedSearch || undefined,
		owner: owner ?? undefined,
		sort: sort.column,
		direction: sort.direction,
		page,
		pageSize: PAGE_SIZE,
	});

	const projects = projectsQuery.data?.data ?? [];
	const pagination = projectsQuery.data?.pagination;

	const ownersQuery = useGetProjectOwnerInfiniteList({
		search: debouncedOwnerSearch || undefined,
	});

	const ownersOptions = useMemo(
		() =>
			(ownersQuery.data?.pages ?? [])
				.flatMap(({ data }) => data)
				.map(({ id, name }) => ({ value: id, label: name })),
		[ownersQuery.data],
	);

	const ownerName = useSelectedOwnerName(owner, projects);

	const deleteProject = useDeleteProject();

	const handleResumeSubmission = useCallback(
		(project: Project) =>
			void navigate({
				to: "/projetos/$id/documentos",
				params: { id: project.id },
			}),
		[navigate],
	);

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

	const handleSortChange = (column: ProjectSort) => {
		setSort((prev) => ({
			column,
			direction: prev.column === column && prev.direction === "ASC" ? "DESC" : "ASC",
		}));
		setPage(1);
	};

	const handleSearchChange = (value: string) => {
		setSearch(value);
		setPage(1);
	};

	const handleOwnerChange = (value: string | null) => {
		setOwner(value);
		setPage(1);
	};

	const clearFilters = () => {
		setSearch("");
		setOwner(null);
		setPage(1);
	};

	const hasActiveFilters = Boolean(search.trim() || owner);

	return (
		<section aria-labelledby={headingId} className="flex flex-col gap-4">
			<SectionHeading
				id={headingId}
				meta={pagination ? `${pagination.total} projetos` : undefined}
			>
				Projetos Ativos
			</SectionHeading>

			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<SearchInput
					value={search}
					onValueChange={handleSearchChange}
					placeholder="Buscar por protocolo ou nome"
					label="Buscar projetos ativos por protocolo ou nome"
					className="max-w-md"
				/>

				<div className="flex items-center gap-2">
					<InfiniteFilterMenu
						label="Projetista"
						allLabel="Todos os projetistas"
						searchPlaceholder="Buscar projetista"
						emptyMessage="Nenhum projetista encontrado."
						options={ownersOptions}
						value={owner}
						selectedLabel={ownerName}
						onValueChange={handleOwnerChange}
						onSearchChange={setOwnerSearch}
						hasNextPage={ownersQuery.hasNextPage}
						isFetchingNextPage={ownersQuery.isFetchingNextPage}
						isLoading={ownersQuery.isPending}
						onLoadMore={() => void ownersQuery.fetchNextPage()}
					/>
				</div>
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
					onResumeSubmission={handleResumeSubmission}
					onContinueDraft={handleContinueDraft}
					onViewProject={handleViewProject}
					onEditProject={handleEditProject}
					onDeleteProject={handleDeleteProject}
					sort={sort}
					onSortChange={handleSortChange}
					onClearFilters={hasActiveFilters ? clearFilters : undefined}
				/>
			)}

			{pagination && !projectsQuery.isError ? (
				<Pagination
					page={pagination.page}
					pageSize={pagination.pageSize}
					total={pagination.total}
					onPageChange={setPage}
					itemLabel="projetos"
				/>
			) : null}

			<ProjectDeleteDialog
				project={projectToDelete}
				isPending={deleteProject.isPending}
				onOpenChange={(open) => {
					if (!open) setProjectToDelete(null);
				}}
				onConfirm={confirmProjectDeletion}
			/>
		</section>
	);
};
