import { DataTable } from "@components/DataTable";
import { EmptyState } from "@components/EmptyState";
import { Button } from "@components/ui/button";
import type { Project } from "@services/projects";
import { useMemo } from "react";

import { createProjectColumns, type ProjectColumnId } from "./project-columns";

const projectColumnClassNames = {
	status: "w-96",
	createdAt: "w-48",
	updatedAt: "w-48",
} satisfies Partial<Record<ProjectColumnId, string>>;

interface ProjectsTableProps {
	projects: Project[];
	isLoading?: boolean;
	onViewFindings: (project: Project) => void;
	onResumeSubmission: (project: Project) => void;
	/** Without it the empty state offers no way out of an over-narrow filter. */
	onClearFilters?: () => void;
	className?: string;
}

export const ProjectsTable = ({
	projects,
	isLoading = false,
	onViewFindings,
	onResumeSubmission,
	onClearFilters,
	className,
}: ProjectsTableProps) => {
	const columns = useMemo(
		() => createProjectColumns({ onViewFindings, onResumeSubmission }),
		[onResumeSubmission, onViewFindings],
	);

	return (
		<DataTable
			columns={columns}
			data={projects}
			isLoading={isLoading}
			columnClassNames={projectColumnClassNames}
			className={className}
			emptyTitle="Nenhum projeto encontrado para os critérios informados"
			emptyDescription="Verifique o protocolo ou o nome do projeto e tente novamente."
			empty={
				onClearFilters ? (
					<EmptyState
						title="Nenhum projeto encontrado para os critérios informados"
						description="Verifique o protocolo ou o nome do projeto, ou limpe os filtros para ver todos."
						action={
							<Button type="button" variant="outline" onClick={onClearFilters}>
								Limpar filtros
							</Button>
						}
					/>
				) : undefined
			}
		/>
	);
};
