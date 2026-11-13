import { EmptyState } from "@components/EmptyState";
import { Button } from "@components/ui/button";
import { downloadFile, type SortDirection } from "@features/shared";
import {
	useGetProjectEventList,
	useGetProjectRework,
} from "@services/project-events";
import { useGetFindingList } from "@services/project-review";
import {
	useCompareProjectVersions,
	useDownloadVersionFile,
	useGetProjectVersionList,
} from "@services/project-versions";
import { useGetProject } from "@services/projects";
import { CircleAlert, History } from "lucide-react";
import { useEffect, useState } from "react";

import {
	ProjectTimeline,
	ProjectVersionList,
	ReworkPanel,
	VersionChangesField,
	VersionComparisonView,
	type VersionDownload,
} from "../../components";
import { defaultComparedVersions } from "../../constants";
import { useComparedVersions } from "../../hooks";

interface ProjectHistoryPageProps {
	projectId: string;
}

export const ProjectHistoryPage = ({ projectId }: ProjectHistoryPageProps) => {
	const [direction, setDirection] = useState<SortDirection>("DESC");
	const eventsQuery = useGetProjectEventList(projectId, { direction });
	const reworkQuery = useGetProjectRework(projectId);
	const versionsQuery = useGetProjectVersionList(projectId);
	const { data: project } = useGetProject(projectId);
	const detail = project?.data;
	const pendingSubmission =
		detail?.status === "UNDER_REVIEW" && detail.reviewDeadline
			? { version: detail.reviewCycle, reviewDeadline: detail.reviewDeadline }
			: undefined;
	const { data: findings } = useGetFindingList(projectId);
	const downloadFileOfVersion = useDownloadVersionFile();
	const { compared, compare, close } = useComparedVersions();

	const versions = versionsQuery.data?.data;
	const knownNumbers = new Set(versions?.map(({ number }) => number));
	// A pair from an old link may name a version this project does not have.
	const comparing =
		compared !== null &&
		knownNumbers.has(compared.from) &&
		knownNumbers.has(compared.to)
			? compared
			: null;
	const staleLink = versions !== undefined && compared !== null && !comparing;
	// A link to a version this project lacks leaves the URL instead of lingering there.
	useEffect(() => {
		if (staleLink) close();
	}, [staleLink, close]);
	const comparisonQuery = useCompareProjectVersions(
		{ projectId, from: comparing?.from ?? 0, to: comparing?.to ?? 0 },
		{ enabled: comparing !== null },
	);

	const awaitingFindings =
		findings?.data.filter(({ status }) => status === "FIXED").length ?? 0;

	const download = ({ version, file }: VersionDownload) =>
		downloadFileOfVersion.mutate(
			{ projectId, version, file },
			{ onSuccess: ({ blob, filename }) => downloadFile(blob, filename) },
		);

	const openComparison = () => {
		const pair = versions ? defaultComparedVersions(versions) : null;
		if (pair) compare(pair);
	};

	if (eventsQuery.isError || reworkQuery.isError) {
		return (
			<div className="flex-1 px-6 py-8 md:px-10">
				<EmptyState
					title="Não foi possível carregar o histórico"
					description="Confira o aviso exibido e tente novamente."
					icon={CircleAlert}
					action={
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								void eventsQuery.refetch();
								void reworkQuery.refetch();
							}}
						>
							Tentar Novamente
						</Button>
					}
				/>
			</div>
		);
	}

	const versionList = (
		<ProjectVersionList
			versions={versions}
			isLoading={versionsQuery.isPending}
			onDownload={download}
			downloading={
				downloadFileOfVersion.isPending
					? downloadFileOfVersion.variables
					: undefined
			}
			onCompare={comparing ? undefined : openComparison}
			className="px-6 py-8 md:px-10 @5xl:px-8"
		/>
	);

	return (
		<div className="grid flex-1 content-start @5xl:grid-cols-[minmax(0,1fr)_400px]">
			{comparing && versions ? (
				<VersionComparisonView
					versions={versions}
					compared={comparing}
					onComparedChange={compare}
					onClose={close}
					comparison={comparisonQuery.data?.data}
					isLoading={comparisonQuery.isPending}
					isError={comparisonQuery.isError}
					onRetry={() => void comparisonQuery.refetch()}
					className="min-w-0 px-6 py-8 md:px-10"
				/>
			) : (
				<ProjectTimeline
					events={eventsQuery.data?.data}
					pendingSubmission={pendingSubmission}
					direction={direction}
					onDirectionChange={setDirection}
					isLoading={eventsQuery.isPending}
					empty={
						<EmptyState
							title="Nenhum evento registrado"
							description="A criação, os envios e as decisões deste projeto aparecem aqui conforme acontecem."
							icon={History}
						/>
					}
					className="min-w-0 px-6 py-8 md:px-10"
				/>
			)}

			<div className="flex flex-col border-t border-border @5xl:border-t-0 @5xl:border-l">
				{comparing ? (
					<VersionChangesField
						comparison={comparisonQuery.data?.data}
						isError={comparisonQuery.isError}
						className="m-6 md:mx-10 @5xl:mx-6"
					/>
				) : (
					<ReworkPanel
						rework={reworkQuery.data?.data}
						approved={detail?.status === "APPROVED"}
						awaitingFindings={awaitingFindings}
						isLoading={reworkQuery.isPending}
					/>
				)}
				{versionsQuery.isError ? (
					<p className="px-6 py-8 text-sm text-muted-foreground md:px-10">
						Não foi possível carregar as versões do projeto.
					</p>
				) : (
					versionList
				)}
			</div>
		</div>
	);
};
