import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";
import { X } from "lucide-react";

export interface ActiveFilter {
	id: string;
	label: string;
	onRemove: () => void;
}

interface ActiveFiltersProps {
	filters: readonly ActiveFilter[];
	onClear: () => void;
	className?: string;
}

export const ActiveFilters = ({
	filters,
	onClear,
	className,
}: ActiveFiltersProps) => {
	if (filters.length === 0) return null;

	return (
		<div
			role="group"
			aria-label="Filtros ativos"
			className={cn(
				"flex flex-wrap items-center gap-2 border-t border-dashed border-border pt-4",
				className,
			)}
		>
			<span className="mr-1 font-mono text-xs tracking-wider text-muted-foreground uppercase">
				Filtros ativos
			</span>
			{filters.map((filter) => (
				<Badge key={filter.id} variant="tag" className="max-w-full gap-1 pr-1">
					<span className="truncate">{filter.label}</span>
					<button
						type="button"
						onClick={filter.onRemove}
						aria-label={`Remover filtro ${filter.label}`}
						className="flex size-5 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
					>
						<X className="size-3" aria-hidden="true" />
					</button>
				</Badge>
			))}
			<Button
				type="button"
				variant="ghost"
				size="xs"
				onClick={onClear}
				className="ml-auto"
			>
				<X aria-hidden="true" />
				Limpar Filtros
			</Button>
		</div>
	);
};
