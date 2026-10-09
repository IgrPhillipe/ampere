import { FilterTiles } from "@components/FilterTiles";
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
	counts?: ReviewQueueIndicators;
	filter: ReviewQueueFilter;
	onFilterChange: (filter: ReviewQueueFilter) => void;
	search: string;
	onSearchChange: (value: string) => void;
	sort: ReviewQueueSort;
	onSortChange: (sort: ReviewQueueSort) => void;
	className?: string;
}

export const ReviewQueueToolbar = ({
	counts,
	filter,
	onFilterChange,
	search,
	onSearchChange,
	sort,
	onSortChange,
	className,
}: ReviewQueueToolbarProps) => (
	<div className={cn("flex flex-col bg-card", className)}>
		<FilterTiles
			label="Filtrar fila de análise"
			tiles={[
				{ value: "ALL", label: "Todos na fila", count: counts?.total ?? 0 },
				{
					value: "DUE_SOON",
					label: "Vencendo o prazo",
					count: counts?.dueSoon ?? 0,
				},
				{
					value: "HIGH_DEMAND",
					label: "Acima de 50 kVA",
					count: counts?.highDemand ?? 0,
				},
				{
					value: "REANALYSIS",
					label: "Reanálise",
					count: counts?.reanalysis ?? 0,
				},
			]}
			value={filter}
			onValueChange={onFilterChange}
		/>

		<div className="flex flex-col gap-4 border-b border-border px-gutter py-4 sm:flex-row sm:items-center sm:justify-between md:px-gutter-md">
			<SearchInput
				value={search}
				onValueChange={onSearchChange}
				placeholder="Buscar por protocolo, projetista ou município"
				label="Buscar na fila de análise"
			/>

			<Button
				type="button"
				size="xs"
				variant="neutral"
				aria-label={`Ordenar por prazo ${
					sort === "DEADLINE_ASC" ? "decrescente" : "crescente"
				}`}
				onClick={() =>
					onSortChange(
						sort === "DEADLINE_ASC" ? "DEADLINE_DESC" : "DEADLINE_ASC",
					)
				}
				className="shrink-0 gap-2 self-start font-mono font-normal tracking-wider uppercase sm:self-auto"
			>
				<span className="text-muted-foreground">Ordenar por</span>
				<span className="font-semibold">Prazo</span>
				{sort === "DEADLINE_ASC" ? (
					<ArrowDown aria-hidden="true" />
				) : (
					<ArrowUp aria-hidden="true" />
				)}
			</Button>
		</div>
	</div>
);
