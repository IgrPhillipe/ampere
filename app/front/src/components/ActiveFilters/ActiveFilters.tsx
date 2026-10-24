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
			className={cn("flex flex-wrap items-center gap-2", className)}
		>
			{filters.map((filter) => (
				<span
					key={filter.id}
					className="inline-flex h-8 max-w-full items-center gap-1 rounded-full border border-border bg-muted pr-1 pl-3 text-xs text-foreground"
				>
					<span className="truncate">{filter.label}</span>
					<button
						type="button"
						onClick={filter.onRemove}
						aria-label={`Remover filtro ${filter.label}`}
						className="flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
					>
						<X className="size-3.5" aria-hidden="true" />
					</button>
				</span>
			))}
			<Button
				type="button"
				variant="link"
				size="xs"
				onClick={onClear}
				className="ml-1"
			>
				Limpar Filtros
			</Button>
		</div>
	);
};
