import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface ProjectPaginationProps {
	page: number;
	pageSize: number;
	total: number;
	onPageChange: (page: number) => void;
	className?: string;
}

export const ProjectPagination = ({
	page,
	pageSize,
	total,
	onPageChange,
	className,
}: ProjectPaginationProps) => {
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const lastItem = Math.min(page * pageSize, total);
	const firstItem = total === 0 ? 0 : (page - 1) * pageSize + 1;

	return (
		<div
			className={cn(
				"mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-border bg-card px-gutter py-2 md:px-gutter-md",
				className,
			)}
		>
			<p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
				{firstItem}–{lastItem} de {total} projetos
			</p>

			<nav className="flex gap-2" aria-label="Paginação de projetos">
				<Button
					type="button"
					variant="neutral"
					size="icon-xs"
					disabled={page <= 1}
					onClick={() => onPageChange(page - 1)}
					aria-label="Página anterior"
				>
					<ArrowLeft aria-hidden="true" />
				</Button>
				<Button
					type="button"
					variant="neutral"
					size="icon-xs"
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
