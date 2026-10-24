import { DataTable } from "@components/DataTable";
import { EmptyState } from "@components/EmptyState";
import { SkeletonTable } from "@components/SkeletonTable";
import { Button } from "@components/ui/button";
import type { ListSort } from "@features/shared";
import { cn } from "@lib/utils";
import type { Project, ProjectSort } from "@services/projects";
import { useMemo } from "react";

import { ProjectCards } from "./ProjectCards";
import { createProjectColumns, type ProjectColumnId } from "./project-columns";
import type { ProjectRowActions } from "./project-row";

/** `table-fixed`: these widths hold, and the name takes what is left. */
const projectColumnClassNames = {
	attention: "w-10 pr-0",
	protocol: "w-32 text-center",
	owner: "hidden xl:table-cell xl:w-36",
	status: "w-48 text-center",
	pending: "w-28 text-center",
	units: "hidden xl:table-cell xl:w-16 text-center",
	demand: "hidden xl:table-cell xl:w-28 text-center",
	createdAt: "hidden 2xl:table-cell 2xl:w-32 text-center",
	updatedAt: "w-32 text-center",
	action: "w-36",
} satisfies Partial<Record<ProjectColumnId, string>>;

const sortableColumns = [
	"name",
	"owner",
	"demand",
	"createdAt",
	"updatedAt",
] as const satisfies readonly ProjectSort[];

interface ProjectsTableProps extends ProjectRowActions {
	projects: Project[];
	showOwner?: boolean;
	isLoading?: boolean;
	sort?: ListSort<ProjectSort>;
	onSortChange?: (column: ProjectSort) => void;
	/** Without it the empty state offers no way out of an over-narrow filter. */
	onClearFilters?: () => void;
	className?: string;
}

export const ProjectsTable = ({
	projects,
	showOwner = false,
	isLoading = false,
	onViewFindings,
	onResumeSubmission,
	onContinueDraft,
	onViewProject,
	onEditProject,
	onDeleteProject,
	sort,
	onSortChange,
	onClearFilters,
	className,
}: ProjectsTableProps) => {
	const actions = useMemo(
		() => ({
			onViewFindings,
			onResumeSubmission,
			onContinueDraft,
			onViewProject,
			onEditProject,
			onDeleteProject,
		}),
		[
			onViewFindings,
			onResumeSubmission,
			onContinueDraft,
			onViewProject,
			onEditProject,
			onDeleteProject,
		],
	);
	const columns = useMemo(
		() => createProjectColumns(actions, { showOwner }),
		[actions, showOwner],
	);

	// Carregamento e vazio ficam aqui, e nao dentro do `DataTable`, porque a
	// tabela e os cartoes sao duas renderizacoes da mesma lista: deixar para o
	// `DataTable` faria o estado vazio aparecer duas vezes, uma por breakpoint.
	if (isLoading) return <SkeletonTable columns={10} />;

	if (projects.length === 0) {
		return onClearFilters ? (
			<EmptyState
				title="Nenhum projeto encontrado para os critérios informados"
				description="Revise a busca e os filtros, ou limpe os filtros para ver todos os projetos."
				action={
					<Button type="button" variant="outline" onClick={onClearFilters}>
						Limpar Filtros
					</Button>
				}
			/>
		) : (
			<EmptyState
				title="Nenhum projeto encontrado para os critérios informados"
				description="Verifique o protocolo ou o nome do projeto e tente novamente."
			/>
		);
	}

	return (
		<>
			<ProjectCards
				projects={projects}
				showOwner={showOwner}
				{...actions}
				className={cn("lg:hidden", className)}
			/>

			<DataTable<Project, ProjectColumnId, ProjectSort>
				columns={columns}
				data={projects}
				columnClassNames={projectColumnClassNames}
				sortableColumns={sortableColumns}
				sort={sort}
				onSortChange={onSortChange}
				className={cn("hidden lg:block", className)}
			/>
		</>
	);
};
