import { SearchInput } from "@components/SearchInput";
import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";
import type {
	ReviewQueueFilter,
	ReviewQueueIndicators,
	ReviewQueueSort,
} from "@services/review-queue";
import { ArrowDown, ArrowUp } from "lucide-react";

interface ReviewQueueToolbarProps {
	search: string;
	onSearchChange: (value: string) => void;
	filter: ReviewQueueFilter;
	onFilterChange: (filter: ReviewQueueFilter) => void;
	counts?: ReviewQueueIndicators;
	sort: ReviewQueueSort;
	onSortChange: (sort: ReviewQueueSort) => void;
	className?: string;
}

const filterOptions: Array<{
	value: ReviewQueueFilter;
	label: string;
	countKey: keyof Pick<
		ReviewQueueIndicators,
		"total" | "dueSoon" | "highDemand" | "reanalysis"
	>;
}> = [
	{ value: "ALL", label: "Todos", countKey: "total" },
	{ value: "DUE_SOON", label: "Vencendo prazo", countKey: "dueSoon" },
	{ value: "HIGH_DEMAND", label: "Acima de 50 kVA", countKey: "highDemand" },
	{ value: "REANALYSIS", label: "Reanálise", countKey: "reanalysis" },
];

const formatCount = (count: number) => String(count).padStart(2, "0");

export const ReviewQueueToolbar = ({
	search,
	onSearchChange,
	filter,
	onFilterChange,
	counts,
	sort,
	onSortChange,
	className,
}: ReviewQueueToolbarProps) => (
	<div
		className={cn(
			"flex flex-col gap-4 border-b border-border bg-card px-gutter py-4 lg:flex-row lg:items-center md:px-gutter-md",
			className,
		)}
	>
		<SearchInput
			value={search}
			onValueChange={onSearchChange}
			placeholder="Buscar protocolo, projetista ou município"
			label="Buscar na fila de análise"
			className="lg:w-[32rem] lg:shrink-0"
		/>

		<div
			role="group"
			aria-label="Filtrar fila de análise"
			className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:pb-0"
		>
			{filterOptions.map((option) => {
				const isActive = filter === option.value;
				const count = counts?.[option.countKey];

				return (
					<Button
						key={option.value}
						type="button"
						size="xs"
						variant="neutral"
						aria-pressed={isActive}
						onClick={() => onFilterChange(option.value)}
						className={cn(
							"shrink-0",
							isActive &&
								"border-[#1e1a13] bg-[#1e1a13] text-white hover:bg-[#1e1a13]/90 hover:text-white",
						)}
					>
						{option.label}
						{count === undefined ? null : (
							<span
								aria-label={`${count} projetos`}
								className={cn(
									"font-mono text-[0.625rem] tabular-nums",
									isActive ? "text-white/75" : "text-muted-foreground",
								)}
							>
								{formatCount(count)}
							</span>
						)}
					</Button>
				);
			})}
		</div>

		<Button
			type="button"
			size="xs"
			variant="neutral"
			aria-label={`Ordenar por prazo ${
				sort === "DEADLINE_ASC" ? "decrescente" : "crescente"
			}`}
			onClick={() =>
				onSortChange(sort === "DEADLINE_ASC" ? "DEADLINE_DESC" : "DEADLINE_ASC")
			}
			className="shrink-0 gap-2 lg:ml-auto"
		>
			<span className="font-mono text-[0.625rem] font-normal tracking-wider text-muted-foreground uppercase">
				Ordenar por
			</span>
			<span>Prazo</span>
			{sort === "DEADLINE_ASC" ? (
				<ArrowDown aria-hidden="true" />
			) : (
				<ArrowUp aria-hidden="true" />
			)}
		</Button>
	</div>
);
