import { EmptyState } from "@components/EmptyState";
import { PageLayout } from "@components/layout";
import { SectionHeading } from "@components/SectionHeading";
import { Button } from "@components/ui/button";
import { padCount } from "@features/shared";
import {
	type ReviewerDistribution,
	type ReviewerMunicipality,
	useGetReviewerDistribution,
	useUpdateReviewerMunicipalities,
} from "@services/reviewer-distribution";
import { CircleAlert } from "lucide-react";
import { useState } from "react";

import {
	MunicipalitiesDialog,
	ReviewerDistributionTable,
	UnassignedMunicipalities,
} from "../../components";
import { getUnassignedMunicipalities } from "../../constants";

export const DistributionPage = () => {
	const distributionQuery = useGetReviewerDistribution();
	const updateMunicipalities = useUpdateReviewerMunicipalities();
	const [isDialogOpen, setDialogOpen] = useState(false);
	// Kept after closing so the dialog does not swap content mid-animation.
	const [editing, setEditing] = useState<ReviewerDistribution | null>(null);

	const distribution = distributionQuery.data?.data ?? [];
	const unassigned = getUnassignedMunicipalities(distribution);

	const edit = (item: ReviewerDistribution) => {
		setEditing(item);
		setDialogOpen(true);
	};

	const save = (municipalities: ReviewerMunicipality[]) => {
		if (!editing) return;

		updateMunicipalities.mutate(
			{ reviewerId: editing.reviewer.id, municipalities },
			{ onSuccess: () => setDialogOpen(false) },
		);
	};

	return (
		<PageLayout
			title="Distribuição"
			description="Defina os municípios de cada analista. Os projetos enviados de um município vão direto para o analista dele."
		>
			{distributionQuery.isError ? (
				<EmptyState
					title="Não foi possível carregar a distribuição"
					description="Verifique sua conexão e tente novamente."
					icon={CircleAlert}
					action={
						<Button
							type="button"
							variant="outline"
							onClick={() => void distributionQuery.refetch()}
						>
							Tentar Novamente
						</Button>
					}
				/>
			) : (
				<div className="flex flex-col gap-10">
					<section
						aria-labelledby="distribution-reviewers"
						className="flex flex-col gap-4"
					>
						<SectionHeading
							id="distribution-reviewers"
							meta={
								distributionQuery.data
									? `${padCount(distribution.length)} ativos`
									: undefined
							}
						>
							Analistas
						</SectionHeading>
						<ReviewerDistributionTable
							items={distribution}
							isLoading={distributionQuery.isPending}
							onEdit={edit}
						/>
					</section>

					{distributionQuery.data ? (
						<UnassignedMunicipalities municipalities={unassigned} />
					) : null}
				</div>
			)}

			<MunicipalitiesDialog
				open={isDialogOpen}
				reviewer={editing}
				distribution={distribution}
				isPending={updateMunicipalities.isPending}
				onOpenChange={setDialogOpen}
				onSave={save}
			/>
		</PageLayout>
	);
};
