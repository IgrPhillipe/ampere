import { FilterTiles } from "@components/FilterTiles";
import { ListToolbar } from "@components/ListToolbar";
import { SearchInput } from "@components/SearchInput";
import { SortMenu, type SortOption } from "@components/SortMenu";
import { type ListSort, padCount } from "@features/shared";
import type {
	ReviewQueueFilter,
	ReviewQueueIndicators,
	ReviewQueueSort,
} from "@services/review-queue";
import type { ReactNode } from "react";

import { REVIEW_QUEUE_SORT_DIRECTIONS } from "../../hooks";

const sortOptions: SortOption<ReviewQueueSort>[] = [
	{ value: "deadline", label: "Vencimento" },
	{ value: "submittedAt", label: "Recebimento" },
	{ value: "demand", label: "Demanda" },
	{ value: "warnings", label: "Alertas" },
];

const formatPercent = (value: number) =>
	`${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;

interface ReviewQueueToolbarProps {
	indicators?: ReviewQueueIndicators;
	filter: ReviewQueueFilter;
	onFilterChange: (filter: ReviewQueueFilter) => void;
	search: string;
	onSearchChange: (value: string) => void;
	sort: ListSort<ReviewQueueSort>;
	onSortChange: (sort: ListSort<ReviewQueueSort>) => void;
	refinements?: ReactNode;
	activeFilters?: ReactNode;
	className?: string;
}

export const ReviewQueueToolbar = ({
	indicators,
	filter,
	onFilterChange,
	search,
	onSearchChange,
	sort,
	onSortChange,
	refinements,
	activeFilters,
	className,
}: ReviewQueueToolbarProps) => (
	<ListToolbar
		className={className}
		filters={
			<FilterTiles
				label="Filtrar fila de análise"
				tiles={[
					{
						value: "ALL",
						label: "Todos na fila",
						count: indicators?.total ?? 0,
					},
					{
						value: "DUE_SOON",
						label: "Vencendo o prazo",
						count: indicators?.dueSoon ?? 0,
					},
					{
						value: "HIGH_DEMAND",
						label: "Acima de 50 kVA",
						count: indicators?.highDemand ?? 0,
					},
					{
						value: "REANALYSIS",
						label: "Reanálise",
						count: indicators?.reanalysis ?? 0,
					},
				]}
				stats={[
					{
						label: "Analisados hoje",
						value: indicators && padCount(indicators.reviewedToday),
					},
					{
						label: "Reprovados no mês",
						value:
							indicators && formatPercent(indicators.monthlyRejectionPercent),
					},
				]}
				value={filter}
				onValueChange={onFilterChange}
			/>
		}
		search={
			<SearchInput
				value={search}
				onValueChange={onSearchChange}
				placeholder="Buscar por protocolo, projetista ou município"
				label="Buscar na fila de análise"
			/>
		}
		sort={
			<SortMenu
				options={sortOptions}
				value={sort}
				directions={REVIEW_QUEUE_SORT_DIRECTIONS}
				onValueChange={onSortChange}
			/>
		}
		refinements={refinements}
		activeFilters={activeFilters}
	/>
);
