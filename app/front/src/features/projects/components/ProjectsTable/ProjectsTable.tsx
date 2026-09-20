import { DataTable } from "@components/DataTable";
import type { Project } from "@services/projects";
import { useMemo } from "react";

import { createProjectColumns } from "./project-columns";

const projectColumnClassNames = {
	status: "w-96",
	createdAt: "w-48",
	updatedAt: "w-48",
};

interface ProjectsTableProps {
	projects: Project[];
	isLoading?: boolean;
	onViewFindings: (project: Project) => void;
	onResumeSubmission: (project: Project) => void;
	className?: string;
}

export const ProjectsTable = ({
	projects,
	isLoading = false,
	onViewFindings,
	onResumeSubmission,
	className,
}: ProjectsTableProps) => {
	const columns = useMemo(
		() => createProjectColumns(onViewFindings, onResumeSubmission),
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
		/>
	);
};
