import { Breadcrumb, type BreadcrumbItem } from "@components/Breadcrumb";
import { useAuthStore } from "@features/shared";

import { getProjectsPageTitle } from "../../constants";

interface ProjectBreadcrumbProps {
	/** Omitted while the project does not exist yet or is loading. */
	project?: { id: string; name: string };
	/** The step the page shows; without it, the project is the current page. */
	current?: string;
	className?: string;
}

export const ProjectBreadcrumb = ({
	project,
	current,
	className,
}: ProjectBreadcrumbProps) => {
	const role = useAuthStore((state) => state.user?.role);
	const items: BreadcrumbItem[] = [
		{ label: getProjectsPageTitle(role), to: "/projetos" },
	];

	if (project) {
		items.push({
			label: project.name,
			to: "/projetos/$id",
			params: { id: project.id },
		});
	}
	if (current) {
		items.push({ label: current });
	}

	return <Breadcrumb items={items} className={className} />;
};
