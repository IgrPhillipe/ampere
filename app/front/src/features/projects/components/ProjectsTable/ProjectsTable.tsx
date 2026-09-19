import { DataTable } from "@components/DataTable";
import type { Project } from "@services/projects";
import { useMemo } from "react";

import { createProjectColumns } from "./project-columns";

interface ProjectsTableProps {
	projects: Project[];
	isLoading?: boolean;
	onViewFindings: (project: Project) => void;
	onResumeSubmission: (project: Project) => void;
}

export const ProjectsTable = ({
	projects,
	isLoading = false,
	onViewFindings,
	onResumeSubmission,
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
			emptyTitle="Nenhum projeto encontrado para os critérios informados"
			emptyDescription="Verifique o protocolo, o nome do projeto ou a UC e tente novamente."
		/>
	);
};
