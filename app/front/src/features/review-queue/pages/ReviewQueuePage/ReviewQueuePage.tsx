import { EmptyState } from "@components/EmptyState";
import { PageLayout } from "@components/layout";
import { Pagination } from "@components/Pagination";
import { Button } from "@components/ui/button";
import {
	type ReviewQueueItem,
	useGetReviewQueue,
	useGetReviewQueueIndicators,
} from "@services/review-queue";
import { useNavigate } from "@tanstack/react-router";
import { CircleAlert } from "lucide-react";

import {
	ReviewQueueActiveFilters,
	ReviewQueueFilterControls,
	ReviewQueueListing,
	ReviewQueueToolbar,
} from "../../components";
import { useReviewQueueFilters } from "../../hooks";

const PAGE_SIZE = 10;

export const ReviewQueuePage = () => {
	const filters = useReviewQueueFilters();
	const {
		filter,
		search,
		debouncedSearch,
		page,
		sort,
		hasActiveFilters,
		setFilter,
		setSearch,
		setPage,
		setSort,
		sortBy,
		clearFilters,
	} = filters;
	const queueQuery = useGetReviewQueue({
		page,
		pageSize: PAGE_SIZE,
		filter,
		search: debouncedSearch || undefined,
		sort: sort.column,
		direction: sort.direction,
		reviewer: filters.reviewer ?? undefined,
		municipality: filters.municipality ?? undefined,
	});
	const indicatorsQuery = useGetReviewQueueIndicators();
	const navigate = useNavigate();

	const analyze = (item: ReviewQueueItem) =>
		void navigate({ to: "/fila-de-analise/$id", params: { id: item.id } });

	const pagination = queueQuery.data?.pagination;
	const hasError = queueQuery.isError || indicatorsQuery.isError;

	return (
		<PageLayout
			title="Fila de Análise"
			description="Acompanhe e priorize os projetos enviados para análise técnica."
			bleed
			className="mx-auto min-h-full w-full max-w-page pb-0 md:pb-0"
		>
			<section
				className="flex flex-1 flex-col bg-card"
				aria-label="Fila de análise técnica"
			>
				<ReviewQueueToolbar
					search={search}
					onSearchChange={setSearch}
					filter={filter}
					onFilterChange={setFilter}
					indicators={indicatorsQuery.data?.data}
					sort={sort}
					onSortChange={setSort}
					refinements={<ReviewQueueFilterControls filters={filters} />}
					activeFilters={<ReviewQueueActiveFilters filters={filters} />}
				/>

				<div className="flex-1 px-gutter py-4 md:px-gutter-md md:py-5">
					{hasError ? (
						<EmptyState
							title="Não foi possível carregar a fila de análise"
							description="Verifique sua conexão e tente novamente."
							icon={CircleAlert}
							action={
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										void queueQuery.refetch();
										void indicatorsQuery.refetch();
									}}
								>
									Tentar Novamente
								</Button>
							}
						/>
					) : (
						<ReviewQueueListing
							items={queueQuery.data?.data ?? []}
							isLoading={queueQuery.isPending}
							onAnalyze={analyze}
							sort={sort}
							onSortChange={sortBy}
							onClearFilters={hasActiveFilters ? clearFilters : undefined}
						/>
					)}
				</div>

				{pagination && !hasError ? (
					<Pagination
						page={pagination.page}
						pageSize={pagination.pageSize}
						total={pagination.total}
						onPageChange={setPage}
						itemLabel="projetos"
					/>
				) : null}
			</section>
		</PageLayout>
	);
};
