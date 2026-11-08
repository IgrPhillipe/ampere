import { cn } from "@lib/utils";
import { Link } from "@tanstack/react-router";

export interface BreadcrumbItem {
	label: string;
	to?: string;
	params?: Record<string, string>;
}

interface BreadcrumbProps {
	items: BreadcrumbItem[];
	className?: string;
}

/** A quiet versalete line, read as the eyebrow above the page title. */
export const Breadcrumb = ({ items, className }: BreadcrumbProps) => (
	<nav aria-label="Navegação estrutural" className={className}>
		<ol className="flex flex-wrap items-center gap-2 font-mono text-2xs tracking-[0.11em] text-faint-foreground uppercase">
			{items.map((item, index) => {
				const isLast = index === items.length - 1;

				return (
					<li
						key={`${index}-${item.label}`}
						className="flex min-w-0 items-center gap-2"
					>
						{item.to && !isLast ? (
							<Link
								to={item.to}
								params={item.params}
								className="truncate underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
							>
								{item.label}
							</Link>
						) : (
							<span
								aria-current={isLast ? "page" : undefined}
								className={cn("truncate", isLast && "text-muted-foreground")}
							>
								{item.label}
							</span>
						)}

						{isLast ? null : <span aria-hidden="true">/</span>}
					</li>
				);
			})}
		</ol>
	</nav>
);
