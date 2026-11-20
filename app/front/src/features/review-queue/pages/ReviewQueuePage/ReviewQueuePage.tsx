import { EmptyState } from "@components/EmptyState";
import { ExportCsvButton } from "@components/ExportCsvButton";
import { PageLayout } from "@components/layout";
import { Pagination } from "@components/Pagination";
import { Button } from "@components/ui/button";
import { downloadFile, useAuthStore } from "@features/shared";
import {
	type ReviewQueueItem,
	UNASSIGNED_REVIEWER,
	useExportReviewQueueCsv,
	useGetReviewerList,
	useGetReviewQueue,
	useGetReviewQueueIndicators,
} from "@services/review-queue";
import { useNavigate } from "@tanstack/react-router";
import { CircleAlert } from "lucide-react";
import { useEffect } from "react";

import {
	ReviewQueueActiveFilters,
	ReviewQueueFilterControls,
	ReviewQueueListing,
	ReviewQueueToolbar,
} from "../../components";
import { useReviewQueueFilters, useSelectedOwnerName } from "../../hooks";

const PAGE_SIZE = 10;

export const ReviewQueuePage = () => {
	const filters = useReviewQueueFilters();
	const {
		filter,
		search,
		sort,
		hasActiveFilters,
		setFilter,
		setSearch,
		setPage,
		setSort,
		sortBy,
		clearFilters,
		reviewer,
		setReviewer,
	} = filters;
	const queueQuery = useGetReviewQueue({
		...filters.params,
		pageSize: PAGE_SIZE,
	});
	const indicatorsQuery = useGetReviewQueueIndicators();
	const navigate = useNavigate();
	const user = useAuthStore((state) => state.user);
	const isManager = user?.role === "admin";
	const exportQueue = useExportReviewQueueCsv();
	const reviewersQuery = useGetReviewerList({ enabled: isManager });
	// A deactivated analyst leaves the list once their last project is reassigned.
	const isReviewerGone =
		reviewer !== null &&
		reviewer !== UNASSIGNED_REVIEWER &&
		reviewersQuery.isSuccess &&
		!reviewersQuery.data.data.some(({ id }) => id === reviewer);

	useEffect(() => {
		if (isReviewerGone) setReviewer(null);
	}, [isReviewerGone, setReviewer]);

	const items = queueQuery.data?.data ?? [];

	const analyze = (item: ReviewQueueItem) =>
		void navigate({ to: "/projetos/$id", params: { id: item.id } });

	// A kept previous page may belong to another designer, so it names no one.
	const ownerName = useSelectedOwnerName(
		filters.owner,
		queueQuery.isPlaceholderData ? [] : (queueQuery.data?.data ?? []),
	);
	const pagination = queueQuery.data?.pagination;
	const hasError = queueQuery.isError || indicatorsQuery.isError;

	const exportCsv = () =>
		exportQueue.mutate(filters.params, {
			onSuccess: ({ blob, filename }) => downloadFile(blob, filename),
		});

	return (
		<PageLayout
			title="Fila de Análise"
			description={
				isManager
					? "Acompanhe e priorize os projetos enviados para análise técnica."
					: "Acompanhe e priorize os projetos atribuídos a você."
			}
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
					ownQueue={!isManager}
					sort={sort}
					onSortChange={setSort}
					actions={
						<ExportCsvButton
							disabled={pagination?.total === 0}
							isPending={exportQueue.isPending}
							onExport={exportCsv}
						/>
					}
					refinements={
						<ReviewQueueFilterControls
							showReviewer={isManager}
							reviewer={filters.reviewer}
							onReviewerChange={filters.setReviewer}
							owner={filters.owner}
							ownerName={ownerName}
							onOwnerChange={filters.setOwner}
							state={filters.state}
							onStateChange={filters.setState}
							municipality={filters.municipality}
							onMunicipalityChange={filters.setMunicipality}
						/>
					}
					activeFilters={
						<ReviewQueueActiveFilters filters={filters} ownerName={ownerName} />
					}
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
							items={items}
							isLoading={queueQuery.isPending}
							onAnalyze={analyze}
							currentUserId={user?.id}
							showReviewer={isManager}
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
