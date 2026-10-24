import { DataTable } from "@components/DataTable";
import { EmptyState } from "@components/EmptyState";
import { SkeletonTable } from "@components/SkeletonTable";
import { Button } from "@components/ui/button";
import type { ListSort } from "@features/shared";
import type { Project, ProjectSort } from "@services/projects";
import { useMemo } from "react";

import { createProjectColumns, type ProjectColumnId } from "./project-columns";
import type { ProjectRowActions } from "./project-row";

/** `table-fixed`: these widths hold, and the name takes what is left. */
const projectColumnClassNames = {
	attention: "w-10 pr-0",
	protocol: "w-28 text-center",
	owner: "w-36",
	status: "w-48 text-center",
	pending: "w-28 text-center",
	units: "w-16 text-center",
	demand: "w-28 text-center",
	createdAt: "w-32 text-center",
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
			onResumeSubmission,
			onContinueDraft,
			onViewProject,
			onEditProject,
			onDeleteProject,
		}),
		[
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
		// Below the desktop width the table keeps its columns and scrolls sideways.
		<DataTable<Project, ProjectColumnId, ProjectSort>
			columns={columns}
			data={projects}
			columnClassNames={projectColumnClassNames}
			sortableColumns={sortableColumns}
			sort={sort}
			onSortChange={onSortChange}
			tableClassName="min-w-[88rem]"
			className={className}
		/>
	);
};
