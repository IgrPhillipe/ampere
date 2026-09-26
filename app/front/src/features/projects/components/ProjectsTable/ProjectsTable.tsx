import { DataTable } from "@components/DataTable";
import { EmptyState } from "@components/EmptyState";
import { SkeletonTable } from "@components/SkeletonTable";
import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";
import type { Project } from "@services/projects";
import { useMemo } from "react";

import { ProjectCards } from "./ProjectCards";
import { createProjectColumns, type ProjectColumnId } from "./project-columns";

/**
 * A tabela e `table-fixed`, entao estas larguras mandam de verdade e a sobra
 * fica com "Projeto". Em telas medias a data de criacao sai: e a coluna menos
 * consultada, e mante-la espremia as outras tres a ponto de o nome do projeto
 * quebrar em cinco linhas.
 */
const projectColumnClassNames = {
	status: "w-56 lg:w-96",
	units: "hidden w-20 lg:table-cell",
	demand: "w-28 lg:w-32",
	createdAt: "hidden lg:table-cell lg:w-48",
	updatedAt: "w-32 lg:w-48",
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

	// Carregamento e vazio ficam aqui, e nao dentro do `DataTable`, porque a
	// tabela e os cartoes sao duas renderizacoes da mesma lista: deixar para o
	// `DataTable` faria o estado vazio aparecer duas vezes, uma por breakpoint.
	if (isLoading) return <SkeletonTable columns={6} />;

	if (projects.length === 0) {
		return onClearFilters ? (
			<EmptyState
				title="Nenhum projeto encontrado para os critérios informados"
				description="Verifique o protocolo ou o nome do projeto, ou limpe os filtros para ver todos."
				action={
					<Button type="button" variant="outline" onClick={onClearFilters}>
						Limpar filtros
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
				onViewFindings={onViewFindings}
				onResumeSubmission={onResumeSubmission}
				className={cn("md:hidden", className)}
			/>

			<DataTable
				columns={columns}
				data={projects}
				columnClassNames={projectColumnClassNames}
				className={cn("hidden md:block", className)}
			/>
		</>
	);
};
