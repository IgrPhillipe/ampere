import { DataTable } from "@components/DataTable";
import { EmptyState } from "@components/EmptyState";
import { SkeletonTable } from "@components/SkeletonTable";
import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";
import type { Project } from "@services/projects";
import { useMemo } from "react";

import { ProjectCards } from "./ProjectCards";
import { createProjectColumns, type ProjectColumnId } from "./project-columns";
import type { ProjectRowActions } from "./project-row";

/** `table-fixed`: these widths hold, and the name takes what is left. */
const projectColumnClassNames = {
	attention: "w-10 pr-0",
	protocol: "w-32",
	status: "w-40",
	units: "w-16",
	demand: "w-28",
	createdAt: "hidden xl:table-cell xl:w-32",
	updatedAt: "w-32",
	action: "w-40",
} satisfies Partial<Record<ProjectColumnId, string>>;

interface ProjectsTableProps extends ProjectRowActions {
	projects: Project[];
	isLoading?: boolean;
	/** Without it the empty state offers no way out of an over-narrow filter. */
	onClearFilters?: () => void;
	className?: string;
}

export const ProjectsTable = ({
	projects,
	isLoading = false,
	onViewFindings,
	onResumeSubmission,
	onContinueDraft,
	onViewProject,
	onClearFilters,
	className,
}: ProjectsTableProps) => {
	const actions = useMemo(
		() => ({
			onViewFindings,
			onResumeSubmission,
			onContinueDraft,
			onViewProject,
		}),
		[onViewFindings, onResumeSubmission, onContinueDraft, onViewProject],
	);
	const columns = useMemo(() => createProjectColumns(actions), [actions]);

	// Carregamento e vazio ficam aqui, e nao dentro do `DataTable`, porque a
	// tabela e os cartoes sao duas renderizacoes da mesma lista: deixar para o
	// `DataTable` faria o estado vazio aparecer duas vezes, uma por breakpoint.
	if (isLoading) return <SkeletonTable columns={9} />;

	if (projects.length === 0) {
		return onClearFilters ? (
			<EmptyState
				title="Nenhum projeto encontrado para os critérios informados"
				description="Verifique o protocolo ou o nome do projeto, ou limpe os filtros para ver todos."
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
				{...actions}
				className={cn("lg:hidden", className)}
			/>

			<DataTable
				columns={columns}
				data={projects}
				columnClassNames={projectColumnClassNames}
				className={cn("hidden lg:block", className)}
			/>
		</>
	);
};
