import { EmptyState } from "@components/EmptyState";
import { Button } from "@components/ui/button";
import type { SortDirection } from "@features/shared";
import {
	useGetProjectEventList,
	useGetProjectRework,
} from "@services/project-events";
import { CircleAlert, History } from "lucide-react";
import { useState } from "react";

import { ProjectTimeline, ReworkPanel } from "../../components";

interface ProjectHistoryPageProps {
	projectId: string;
}

/** The same section for the designer and the analyst: the timeline and, beside it, the rework. */
export const ProjectHistoryPage = ({ projectId }: ProjectHistoryPageProps) => {
	const [direction, setDirection] = useState<SortDirection>("DESC");
	const eventsQuery = useGetProjectEventList(projectId, { direction });
	const reworkQuery = useGetProjectRework(projectId);

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
				isLoading={reworkQuery.isPending}
				className="border-t border-border @5xl:border-t-0 @5xl:border-l"
			/>
		</div>
	);
};
