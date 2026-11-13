import { EmptyState } from "@components/EmptyState";
import { PageLayout } from "@components/layout";
import { Pagination } from "@components/Pagination";
import { Button } from "@components/ui/button";
import { useAuthStore } from "@features/shared";
import {
	type ReviewQueueItem,
	useGetReviewQueue,
	useGetReviewQueueIndicators,
} from "@services/review-queue";
import { useAssignReviewQueue } from "@services/reviewer-distribution";
import { useNavigate } from "@tanstack/react-router";
import { CircleAlert } from "lucide-react";
import { useState } from "react";

import {
	AssignReviewerDialog,
	QueueSelectionBar,
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
	} = filters;
	const queueQuery = useGetReviewQueue({
		...filters.params,
		pageSize: PAGE_SIZE,
	});
	const indicatorsQuery = useGetReviewQueueIndicators();
	const navigate = useNavigate();
	const user = useAuthStore((state) => state.user);
	const isManager = user?.role === "admin";
	const assign = useAssignReviewQueue();
	const [isAssignOpen, setAssignOpen] = useState(false);

	// The selection belongs to the listing it was made on: a new page or filter drops it.
	const listingKey = JSON.stringify(filters.params);
	const [selectionState, setSelectionState] = useState({
		key: listingKey,
		ids: [] as string[],
	});
	const selectedIds =
		selectionState.key === listingKey ? selectionState.ids : [];
	const items = queueQuery.data?.data ?? [];
	const selectedItems = items.filter(({ id }) => selectedIds.includes(id));

	const selection = isManager
		? {
				selectedIds,
				onSelectedIdsChange: (ids: string[]) =>
					setSelectionState({ key: listingKey, ids }),
			}
		: undefined;

	const clearSelection = () => setSelectionState({ key: listingKey, ids: [] });

	const confirmAssignment = (reviewerId: string) =>
		assign.mutate(
			{ projectIds: selectedItems.map(({ id }) => id), reviewerId },
			{
				onSuccess: () => {
					setAssignOpen(false);
					clearSelection();
				},
			},
		);

	const analyze = (item: ReviewQueueItem) =>
		void navigate({ to: "/projetos/$id", params: { id: item.id } });

	// A kept previous page may belong to another designer, so it names no one.
	const ownerName = useSelectedOwnerName(
		filters.owner,
		queueQuery.isPlaceholderData ? [] : (queueQuery.data?.data ?? []),
	);
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
					refinements={
						<ReviewQueueFilterControls
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
						<div className="flex flex-col gap-4">
							{selectedItems.length > 0 ? (
								<QueueSelectionBar
									count={selectedItems.length}
									onClear={clearSelection}
									onAssign={() => setAssignOpen(true)}
								/>
							) : null}
							<ReviewQueueListing
								items={items}
								isLoading={queueQuery.isPending}
								onAnalyze={analyze}
								currentUserId={user?.id}
								selection={selection}
								sort={sort}
								onSortChange={sortBy}
								onClearFilters={hasActiveFilters ? clearFilters : undefined}
							/>
						</div>
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

			{isManager ? (
				<AssignReviewerDialog
					open={isAssignOpen}
					projects={selectedItems}
					isPending={assign.isPending}
					onOpenChange={setAssignOpen}
					onConfirm={confirmAssignment}
				/>
			) : null}
		</PageLayout>
	);
};
