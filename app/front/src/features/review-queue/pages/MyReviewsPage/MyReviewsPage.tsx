import { EmptyState } from "@components/EmptyState";
import { PageLayout } from "@components/layout";
import { Pagination } from "@components/Pagination";
import { Button } from "@components/ui/button";
import { type MyReviewItem, useGetMyReviews } from "@services/review-queue";
import { useNavigate } from "@tanstack/react-router";
import { CircleAlert } from "lucide-react";

import {
	MyReviewsListing,
	MyReviewsToolbar,
	myReviewTargetOf,
} from "../../components";
import { useMyReviewsFilters } from "../../hooks";

const PAGE_SIZE = 10;

/** H13: the projects the signed-in analyst decided, each opening its analysis in consultation. */
export const MyReviewsPage = () => {
	const filters = useMyReviewsFilters();
	const reviewsQuery = useGetMyReviews({
		...filters.params,
		pageSize: PAGE_SIZE,
	});
	const navigate = useNavigate();
	const pagination = reviewsQuery.data?.pagination;

	const open = (item: MyReviewItem) => void navigate(myReviewTargetOf(item));

	return (
		<PageLayout
			title="Meus Pareceres"
			description="Os projetos que você aprovou ou reprovou, com os apontamentos de cada parecer."
			bleed
			className="mx-auto min-h-full w-full max-w-page pb-0 md:pb-0"
		>
			<section
				className="flex flex-1 flex-col bg-card"
				aria-label="Meus pareceres"
			>
				<MyReviewsToolbar
					search={filters.search}
					onSearchChange={filters.setSearch}
					decision={filters.decision}
					onDecisionChange={filters.setDecision}
					counts={reviewsQuery.data?.counts}
					state={filters.state}
					onStateChange={filters.setState}
					municipality={filters.municipality}
					onMunicipalityChange={filters.setMunicipality}
					period={filters.period}
					onPeriodChange={filters.setPeriod}
				/>

				<div className="flex-1 px-gutter py-4 md:px-gutter-md md:py-5">
					{reviewsQuery.isError ? (
						<EmptyState
							title="Não foi possível carregar os seus pareceres"
							description="Verifique sua conexão e tente novamente."
							icon={CircleAlert}
							action={
								<Button
									type="button"
									variant="outline"
									onClick={() => void reviewsQuery.refetch()}
								>
									Tentar Novamente
								</Button>
							}
						/>
					) : (
						<MyReviewsListing
							items={reviewsQuery.data?.data ?? []}
							isLoading={reviewsQuery.isPending}
							onOpen={open}
							onClearFilters={
								filters.hasActiveFilters ? filters.clearFilters : undefined
							}
						/>
					)}
				</div>

				{pagination && !reviewsQuery.isError ? (
					<Pagination
						page={pagination.page}
						pageSize={pagination.pageSize}
						total={pagination.total}
						onPageChange={filters.setPage}
						itemLabel="pareceres"
					/>
				) : null}
			</section>
		</PageLayout>
	);
};
