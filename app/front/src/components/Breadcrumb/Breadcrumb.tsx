import { cn } from "@lib/utils";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
	label: string;
	to?: string;
	params?: Record<string, string>;
}

interface BreadcrumbProps {
	items: BreadcrumbItem[];
	className?: string;
}

export const Breadcrumb = ({ items, className }: BreadcrumbProps) => (
	<nav aria-label="Navegação estrutural" className={className}>
		<ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
			{items.map((item, index) => {
				const isLast = index === items.length - 1;

				return (
					<li
						key={`${index}-${item.label}`}
						className="flex min-w-0 items-center gap-1.5"
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
								className={cn("truncate", isLast && "text-foreground")}
							>
								{item.label}
							</span>
						)}

						{isLast ? null : (
							<ChevronRight aria-hidden="true" className="size-3.5 shrink-0" />
						)}
					</li>
				);
			})}
		</ol>
	</nav>
);
