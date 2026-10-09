import { Badge } from "@components/ui/badge";
import { padCount } from "@features/shared";

interface WarningsBadgeProps {
	warnings: number;
}

export const WarningsBadge = ({ warnings }: WarningsBadgeProps) =>
	warnings > 0 ? (
		<Badge variant="warning">
			{padCount(warnings)} {warnings === 1 ? "Alerta" : "Alertas"}
		</Badge>
	) : (
		<span className="text-sm text-muted-foreground">Sem alertas</span>
	);
