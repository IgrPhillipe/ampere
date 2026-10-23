import { EmptyState } from "@components/EmptyState";
import { PageLayout } from "@components/layout";
import { Button } from "@components/ui/button";
import { Skeleton } from "@components/ui/skeleton";
import { useGetFindingList } from "@services/project-review";
import { useGetProject } from "@services/projects";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CircleAlert, ClipboardCheck } from "lucide-react";

interface ProjectFindingsPageProps {
	projectId: string;
}

export const ProjectFindingsPage = ({
	projectId,
}: ProjectFindingsPageProps) => {
	const navigate = useNavigate();
	const projectQuery = useGetProject(projectId);
	const findingsQuery = useGetFindingList(projectId);
	const project = projectQuery.data?.data;
	const findings = findingsQuery.data?.data;
	const hasError = projectQuery.isError || findingsQuery.isError;

	const backToProjects = () => void navigate({ to: "/projetos" });

	return (
		<PageLayout
			title={project?.name ?? "Apontamentos do projeto"}
			description={
				project
					? `Protocolo ${project.protocol}. Revise os apontamentos antes de reenviar o projeto.`
					: "Revise os apontamentos antes de reenviar o projeto."
			}
			bleed
			className="mx-auto min-h-full w-full max-w-page pb-0 md:pb-0"
		>
			<section
				aria-label="Correção dos apontamentos"
				className="flex flex-1 flex-col gap-6 bg-card px-6 py-8 md:px-8"
			>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className="self-start"
					onClick={backToProjects}
				>
					<ArrowLeft aria-hidden="true" />
					Meus Projetos
				</Button>

				{hasError ? (
					<EmptyState
						title="Não foi possível carregar os apontamentos"
						description="Confira o aviso exibido e tente novamente."
						icon={CircleAlert}
						action={
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									void projectQuery.refetch();
									void findingsQuery.refetch();
								}}
							>
								Tentar novamente
							</Button>
						}
					/>
				) : projectQuery.isPending || findingsQuery.isPending ? (
					<div aria-label="Carregando apontamentos" className="space-y-4">
						<Skeleton className="h-24 w-full" />
						<Skeleton className="h-40 w-full" />
						<Skeleton className="h-40 w-full" />
					</div>
				) : findings?.length === 0 ? (
					<EmptyState
						title="Nenhum apontamento encontrado"
						description="Este projeto não possui correções registradas para o ciclo atual."
						icon={ClipboardCheck}
					/>
				) : (
					<div aria-live="polite" className="text-sm text-muted-foreground">
						{findings?.length}{" "}
						{findings?.length === 1 ? "apontamento" : "apontamentos"}
					</div>
				)}
			</section>
		</PageLayout>
	);
};
