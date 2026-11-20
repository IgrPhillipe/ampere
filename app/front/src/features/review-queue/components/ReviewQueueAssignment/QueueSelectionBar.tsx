import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";
import { UserRoundCheck } from "lucide-react";

interface QueueSelectionBarProps {
	count: number;
	onClear: () => void;
	onAssign: () => void;
	className?: string;
}

export const QueueSelectionBar = ({
	count,
	onClear,
	onAssign,
	className,
}: QueueSelectionBarProps) => (
	<div
		role="toolbar"
		aria-label="Ações dos projetos selecionados"
		className={cn(
			"flex flex-wrap items-center justify-between gap-3 border border-foreground px-4 py-2",
			className,
		)}
	>
		<p className="text-sm font-medium text-foreground" aria-live="polite">
			{count === 1 ? "1 projeto selecionado" : `${count} projetos selecionados`}
		</p>
		<div className="flex items-center gap-2">
			<Button type="button" variant="ghost" size="sm" onClick={onClear}>
				Limpar Seleção
			</Button>
			<Button type="button" size="sm" onClick={onAssign}>
				<UserRoundCheck aria-hidden="true" />
				Atribuir Analista
			</Button>
		</div>
	</div>
);
