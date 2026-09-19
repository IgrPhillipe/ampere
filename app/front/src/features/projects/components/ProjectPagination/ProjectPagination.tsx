import { Button } from "@components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface ProjectPaginationProps {
	page: number;
	pageSize: number;
	total: number;
	onPageChange: (page: number) => void;
}

const formatNumber = (value: number) => String(value).padStart(2, "0");

export const ProjectPagination = ({
	page,
	pageSize,
	total,
	onPageChange,
}: ProjectPaginationProps) => {
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const firstItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
	const lastItem = Math.min(page * pageSize, total);

	return (
		<div className="flex flex-wrap items-center justify-between gap-4 border-t border-border bg-card px-6 py-3">
			<p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
				Mostrando {formatNumber(firstItem)}–{formatNumber(lastItem)} de{" "}
				{formatNumber(total)} projetos
			</p>

			<nav className="flex gap-2" aria-label="Paginação de projetos">
				<Button
					type="button"
					variant="outline"
					size="icon-xs"
					className="rounded-[4px] border-border bg-white text-foreground shadow-none hover:bg-muted hover:text-foreground disabled:border-border disabled:bg-white disabled:text-muted-foreground disabled:opacity-40"
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
					className="rounded-[4px] border-border bg-white text-foreground shadow-none hover:bg-muted hover:text-foreground disabled:border-border disabled:bg-white disabled:text-muted-foreground disabled:opacity-40"
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
