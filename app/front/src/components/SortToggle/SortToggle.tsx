import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";

interface SortToggleProps {
	/** What the list is sorted by: "Prazo", "Atualização". */
	label: string;
	descending: boolean;
	onToggle: () => void;
	className?: string;
}

export const SortToggle = ({
	label,
	descending,
	onToggle,
	className,
}: SortToggleProps) => (
	<Button
		type="button"
		size="xs"
		variant="neutral"
		aria-label={`Ordenar por ${label.toLowerCase()} ${descending ? "crescente" : "decrescente"}`}
		onClick={onToggle}
		className={cn(
			"shrink-0 gap-2 self-start font-mono font-normal tracking-wider uppercase sm:self-auto",
			className,
		)}
	>
		<span className="text-muted-foreground">Ordenar por</span>
		<span className="font-semibold">{label}</span>
		{descending ? (
			<ArrowDown aria-hidden="true" />
		) : (
			<ArrowUp aria-hidden="true" />
		)}
	</Button>
);
