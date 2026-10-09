import { EmptyState } from "@components/EmptyState";
import { PageLayout } from "@components/layout";
import { Button } from "@components/ui/button";
import { Skeleton } from "@components/ui/skeleton";
import { padCount } from "@features/shared";
import dayjs from "@lib/dayjs";
import { useGetLatestCalculation } from "@services/calculation";
import { useGetConsumerUnitGroupValidation } from "@services/consumer-units";
import { useGetProject } from "@services/projects";
import { useGetMemorial, useGetSubmission } from "@services/submission";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, CircleAlert, Download, Send } from "lucide-react";

import { ProjectStamp, ProjectStepper } from "../../components";

interface SubmissionPageProps {
	projectId: string;
}

const REVIEW_PERIOD_DAYS = 30;

export const SubmissionPage = ({ projectId }: SubmissionPageProps) => {
	const navigate = useNavigate();
	const projectQuery = useGetProject(projectId);
	const calculationQuery = useGetLatestCalculation(projectId);
	const submissionQuery = useGetSubmission(projectId);
	const validationQuery = useGetConsumerUnitGroupValidation(projectId);
	const project = projectQuery.data?.data;
	const validation = validationQuery.data?.data;
	const submittedAt = project?.submittedAt;
	const memorialQuery = useGetMemorial(projectId, {
		enabled: Boolean(submittedAt),
	});
	const appliedSteps =
		calculationQuery.data?.data.steps.filter((step) => step.applies).length ??
		0;
	const documents = submissionQuery.data?.data.documents ?? [];

	const downloadMemorial = () => {
		const memorial = memorialQuery.data;
		if (!memorial) return;

		const url = URL.createObjectURL(memorial.blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = memorial.filename;
		link.click();
		URL.revokeObjectURL(url);
	};

	const sent = [
		{ label: "Memorial descritivo de cálculo de demanda", detail: "PDF" },
		{
			label: "Memória de cálculo detalhada",
			detail: `${padCount(appliedSteps)} ${appliedSteps === 1 ? "parcela" : "parcelas"}`,
		},
		...documents.map((document) => ({
			label: document.typeLabel,
			detail: document.filename,
		})),
	];

	const nextSteps = submittedAt
		? [
				{
					title: "Triagem Automática",
					status: "Concluída",
					description: "Norma, tabelas e anexos conferidos pelo sistema.",
				},
				{
					title: "Análise Técnica",
					status: `Até ${dayjs(submittedAt).add(REVIEW_PERIOD_DAYS, "day").format("DD.MM.YYYY")}`,
					description: "Um analista confere a memória de cálculo enviada.",
				},
				{
					title: "Parecer",
					status: "Aguardando",
					description: "Aprovação ou apontamentos para correção.",
				},
			]
		: [];

	const units = validation
		? `${validation.totalUnits} em ${validation.totalGroups} ${
				validation.totalGroups === 1 ? "grupo" : "grupos"
			}`
		: undefined;

	const goToProjects = () => void navigate({ to: "/" });

	return (
		<PageLayout
			bleed
			className="mx-auto min-h-full w-full max-w-page pb-0 md:pb-0"
		>
			<div className="flex flex-1 flex-col bg-card">
				<ProjectStamp
					project={project}
					isLoading={projectQuery.isPending || validationQuery.isPending}
					units={units}
				/>

				<div className="px-6 pt-8 md:px-8">
					<p className="text-xs tracking-wider text-muted-foreground uppercase">
						Etapa 05: Envio
					</p>

					<h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
						Projeto Enviado para Análise
					</h1>
				</div>

				<ProjectStepper current={4} className="mt-6" />

				{projectQuery.isError ? (
					<div className="flex-1 px-6 py-8 md:px-8">
						<EmptyState
							title="Não foi possível carregar o envio"
							description="Confira o aviso exibido e tente novamente."
							icon={CircleAlert}
							action={
								<Button
									type="button"
									variant="outline"
									onClick={() => void projectQuery.refetch()}
								>
									Tentar Novamente
								</Button>
							}
						/>
					</div>
				) : project && !submittedAt ? (
					<div className="flex-1 px-6 py-8 md:px-8">
						<EmptyState
							title="Este projeto ainda não foi enviado"
							description="Anexe os documentos obrigatórios e envie o projeto na etapa do memorial."
							icon={Send}
							action={
								<Button
									type="button"
									variant="outline"
									onClick={() =>
										void navigate({
											to: "/projetos/$id/memorial",
											params: { id: projectId },
										})
									}
								>
									Ir para o Memorial
								</Button>
							}
						/>
					</div>
				) : (
					<div className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_400px]">
						<section className="flex flex-col gap-8 px-6 py-8 md:px-8">
							{submittedAt ? (
								<p className="flex items-center gap-3 border-b-2 border-foreground pb-5 text-xl">
									<Check aria-hidden="true" className="size-5 text-primary" />
									<span>
										Enviado em{" "}
										<time dateTime={submittedAt}>
											{dayjs(submittedAt).format("DD.MM.YYYY [às] HH[h]mm")}
										</time>
									</span>
								</p>
							) : (
								<Skeleton className="h-8 w-72" />
							)}

							<div>
								<h2 className="text-lg font-semibold">O que Foi Enviado</h2>
								<ol className="mt-3 flex flex-col">
									{sent.map(({ label, detail }, index) => (
										<li
											key={label}
											className="flex items-center gap-4 border-b border-border py-3"
										>
											<span className="font-mono text-xs text-muted-foreground">
												{padCount(index + 1)}
											</span>
											<span className="flex-1 text-sm">{label}</span>
											<span className="truncate font-mono text-xs text-muted-foreground">
												{detail}
											</span>
										</li>
									))}
								</ol>
							</div>

							<Button
								type="button"
								variant="link"
								className="mt-auto w-fit"
								disabled={!memorialQuery.data}
								onClick={downloadMemorial}
							>
								<Download aria-hidden="true" />
								Baixar Memorial
							</Button>
						</section>

						<aside className="flex flex-col border-t border-border px-6 py-8 md:px-8 lg:border-t-0 lg:border-l">
							<div className="rounded-xs bg-primary px-6 py-5 text-primary-foreground">
								<h2 className="border-b border-primary-foreground/85 pb-3 font-mono text-xs tracking-[0.08em] text-primary-foreground/75 uppercase">
									Protocolo
								</h2>
								{project ? (
									<p className="mt-6 font-mono text-3xl font-medium tracking-tight">
										{project.protocol}
									</p>
								) : (
									<Skeleton className="mt-6 h-9 w-36 bg-primary-foreground/20" />
								)}
								<p className="mt-2 font-mono text-xs tracking-[0.08em] text-primary-foreground/75 uppercase">
									Guarde este número para acompanhar
								</p>
							</div>

							<h2 className="mt-10 border-b-2 border-foreground pb-3 text-base font-semibold">
								O que Acontece Agora
							</h2>
							<ol className="flex flex-col">
								{nextSteps.map(({ title, status, description }, index) => (
									<li
										key={title}
										className="grid grid-cols-[2rem_minmax(0,1fr)] gap-y-1 border-b border-border py-3"
									>
										<span className="font-mono text-xs text-muted-foreground">
											{padCount(index + 1)}
										</span>
										<div className="flex flex-wrap items-baseline justify-between gap-2">
											<span className="text-sm font-medium">{title}</span>
											<span className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
												{status}
											</span>
										</div>
										<p className="col-start-2 text-sm text-muted-foreground">
											{description}
										</p>
									</li>
								))}
							</ol>
						</aside>
					</div>
				)}

				<div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4 md:px-8">
					<Button type="button" onClick={goToProjects}>
						Ir para Meus Projetos
						<ArrowRight aria-hidden="true" />
					</Button>
				</div>
			</div>
		</PageLayout>
	);
};
