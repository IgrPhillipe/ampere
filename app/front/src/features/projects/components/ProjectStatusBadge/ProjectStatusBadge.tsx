import { Badge } from "@components/ui/badge";
import type { ProjectStatus } from "@services/projects";
import type { ComponentProps } from "react";

interface ProjectStatusBadgeProps {
	status: ProjectStatus;
}

const statusConfig: Record<
	ProjectStatus,
	{
		label: string;
		variant: ComponentProps<typeof Badge>["variant"];
	}
> = {
	DRAFT: { label: "Rascunho", variant: "outline" },
	AWAITING_SUBMISSION: { label: "Aguardando envio", variant: "warning" },
	UNDER_REVIEW: { label: "Em análise", variant: "secondary" },
	REJECTED: { label: "Reprovado", variant: "destructive" },
	APPROVED: { label: "Aprovado", variant: "success" },
};

export const ProjectStatusBadge = ({ status }: ProjectStatusBadgeProps) => {
	const config = statusConfig[status];

	return (
		<Badge variant={config.variant} className="font-mono uppercase">
			{config.label}
		</Badge>
	);
};
