import { PageLayout } from "@components/layout";
import {
	useGetReviewQueue,
	useGetReviewQueueIndicators,
} from "@services/review-queue";

import {
	ReviewQueueIndicators,
	ReviewQueueListing,
	ReviewQueueToolbar,
} from "../../components";
import { useReviewQueueFilters } from "../../hooks";

const PAGE_SIZE = 10;

export const ReviewQueuePage = () => {
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
		clearFilters,
	} = useReviewQueueFilters();
	const queueQuery = useGetReviewQueue({
		page,
		pageSize: PAGE_SIZE,
		filter,
		search: debouncedSearch || undefined,
		sort,
	});
	const indicatorsQuery = useGetReviewQueueIndicators();

	return (
		<PageLayout
			title="Fila de análise"
			description="Acompanhe e priorize os projetos enviados para análise técnica."
			bleed
			className="mx-auto min-h-full w-full max-w-page pb-0 md:pb-0"
		>
			<section
				className="flex flex-1 flex-col bg-card"
				aria-label="Fila de análise técnica"
			>
				<ReviewQueueIndicators />
				<ReviewQueueToolbar
					search={search}
					onSearchChange={setSearch}
					filter={filter}
					onFilterChange={setFilter}
					counts={indicatorsQuery.data?.data}
					sort={sort}
					onSortChange={setSort}
				/>
				<div className="flex-1 px-gutter py-4 md:px-gutter-md md:py-5">
					<ReviewQueueListing
						items={queueQuery.data?.data ?? []}
						pagination={queueQuery.data?.pagination}
						isLoading={queueQuery.isPending}
						isError={queueQuery.isError}
						onRetry={() => void queueQuery.refetch()}
						onPageChange={setPage}
						onClearFilters={hasActiveFilters ? clearFilters : undefined}
					/>
				</div>
			</section>
		</PageLayout>
	);
};
