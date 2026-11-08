import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface PaginationProps {
	page: number;
	pageSize: number;
	total: number;
	onPageChange: (page: number) => void;
	/** Plural of what is being paginated: "projetos", "análises". */
	itemLabel?: string;
	className?: string;
}

export const Pagination = ({
	page,
	pageSize,
	total,
	onPageChange,
	itemLabel = "itens",
	className,
}: PaginationProps) => {
	// The empty state already says there is nothing to page through.
	if (total === 0) return null;

	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const lastItem = Math.min(page * pageSize, total);
	const firstItem = total === 0 ? 0 : (page - 1) * pageSize + 1;

	return (
		<div
			className={cn(
				"mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border bg-card px-gutter py-3 md:px-gutter-md",
				className,
			)}
		>
			<p className="font-mono text-2xs tracking-[0.11em] text-faint-foreground uppercase">
				{firstItem} a {lastItem} de {total} {itemLabel}
			</p>

			<nav className="flex gap-1.5" aria-label={`Paginação de ${itemLabel}`}>
				<Button
					type="button"
					variant="outline"
					size="icon-sm"
					disabled={page <= 1}
					onClick={() => onPageChange(page - 1)}
					aria-label="Página anterior"
				>
					<ArrowLeft aria-hidden="true" />
				</Button>
				<Button
					type="button"
					variant="outline"
					size="icon-sm"
					disabled={page >= totalPages}
					onClick={() => onPageChange(page + 1)}
					aria-label="Próxima página"
				>
					<ArrowRight aria-hidden="true" />
				</Button>
			</nav>
		</div>
	);
};
