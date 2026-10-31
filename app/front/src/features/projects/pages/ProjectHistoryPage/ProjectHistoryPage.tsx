import { EmptyState } from "@components/EmptyState";
import { Button } from "@components/ui/button";
import type { SortDirection } from "@features/shared";
import {
	useGetProjectEventList,
	useGetProjectRework,
} from "@services/project-events";
import { useGetFindingList } from "@services/project-review";
import { useGetProject } from "@services/projects";
import { CircleAlert, History } from "lucide-react";
import { useState } from "react";

import { ProjectTimeline, ReworkPanel } from "../../components";

interface ProjectHistoryPageProps {
	projectId: string;
}

export const ProjectHistoryPage = ({ projectId }: ProjectHistoryPageProps) => {
	const [direction, setDirection] = useState<SortDirection>("DESC");
	const eventsQuery = useGetProjectEventList(projectId, { direction });
	const reworkQuery = useGetProjectRework(projectId);
	const { data: project } = useGetProject(projectId);
	const { data: findings } = useGetFindingList(projectId);
	const awaitingFindings =
		findings?.data.filter(({ status }) => status === "FIXED").length ?? 0;

	if (eventsQuery.isError || reworkQuery.isError) {
		return (
			<div className="flex-1 px-6 py-8 md:px-8">
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

	return (
		<div className="grid flex-1 @5xl:grid-cols-[minmax(0,1fr)_360px]">
			<ProjectTimeline
				events={eventsQuery.data?.data}
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
				className="min-w-0 px-6 py-8 md:px-8"
			/>

			<ReworkPanel
				rework={reworkQuery.data?.data}
				approved={project?.data.status === "APPROVED"}
				awaitingFindings={awaitingFindings}
				isLoading={reworkQuery.isPending}
				className="border-t border-border @5xl:border-t-0 @5xl:border-l"
			/>
		</div>
	);
};
