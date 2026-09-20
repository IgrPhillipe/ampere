import { Button } from "@components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface ProjectPaginationProps {
	page: number;
	pageSize: number;
	total: number;
	onPageChange: (page: number) => void;
}

export const ProjectPagination = ({
	page,
	pageSize,
	total,
	onPageChange,
}: ProjectPaginationProps) => {
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const lastItem = Math.min(page * pageSize, total);
	const firstItem = total === 0 ? 0 : (page - 1) * pageSize + 1;

	return (
		<div className="-mx-4 mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-border bg-card px-10 py-2 md:-mx-7 md:px-[60px]">
			<p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
				{firstItem}–{lastItem} de {total} projetos
			</p>

			<nav className="flex gap-2" aria-label="Paginação de projetos">
				<Button
					type="button"
					variant="outline"
					size="icon-xs"
					className="rounded-[4px] border-border bg-white text-foreground shadow-none hover:bg-neutral-100 hover:text-foreground disabled:border-border disabled:bg-white disabled:text-muted-foreground disabled:opacity-40"
					disabled={page <= 1}
					onClick={() => onPageChange(page - 1)}
					aria-label="Página anterior"
				>
					<ArrowLeft aria-hidden="true" />
				</Button>
				<Button
					type="button"
					variant="outline"
					size="icon-xs"
					className="rounded-[4px] border-border bg-white text-foreground shadow-none hover:bg-neutral-100 hover:text-foreground disabled:border-border disabled:bg-white disabled:text-muted-foreground disabled:opacity-40"
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
