import { cn } from "@lib/utils";
import type { Project } from "@services/projects";
import { CircleAlert } from "lucide-react";

import { getProjectActionLabel } from "./project-row";

interface ProjectActionIndicatorProps {
	project: Project;
	className?: string;
}

/**
 * Indicador amarelo de "precisa da sua acao". Era uma barra fina ao lado do
 * protocolo, que nao dizia o que fazer; agora e um icone com o nome da acao
 * no `title` e para leitor de tela.
 */
export const ProjectActionIndicator = ({
	project,
	className,
}: ProjectActionIndicatorProps) => {
	const label = getProjectActionLabel(project);

	if (!label) return null;

	return (
		<span
			title={label}
			className={cn(
				"inline-flex size-6 items-center justify-center rounded-full bg-brand-sunset/20 text-warning-foreground",
				className,
			)}
		>
			<CircleAlert className="size-3.5" aria-hidden="true" />
			<span className="sr-only">{label}</span>
		</span>
	);
};
