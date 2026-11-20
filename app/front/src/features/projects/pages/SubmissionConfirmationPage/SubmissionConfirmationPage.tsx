import { ConclusionField } from "@components/ConclusionField";
import { EmptyState } from "@components/EmptyState";
import { InlineActionButton } from "@components/InlineActionButton";
import { Eyebrow } from "@components/layout";
import { SectionHeading } from "@components/SectionHeading";
import { Button } from "@components/ui/button";
import { Skeleton } from "@components/ui/skeleton";
import {
	downloadFile,
	formatDate,
	formatDateTime,
	formatKva,
	padCount,
} from "@features/shared";
import dayjs from "@lib/dayjs";
import { useGetLatestCalculation } from "@services/calculation";
import { useGetFindingList } from "@services/project-review";
import { type ProjectDetail, useGetProject } from "@services/projects";
import { useGetMemorial, useGetSubmission } from "@services/submission";
import { Link, Navigate } from "@tanstack/react-router";
import { ArrowRight, Check, CircleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import {
	type ReceiptItem,
	ReceiptList,
} from "../../components/SubmissionReceipt";
import { findingStageLabels, findingStatusLabels } from "../../constants";
import { useProjectPermissions } from "../../hooks";

/** Same period the overview counts for the technical review. */
const REVIEW_PERIOD_DAYS = 30;

interface SummaryCellProps {
	label: string;
	children: ReactNode;
	mono?: boolean;
}

const SummaryCell = ({ label, children, mono = true }: SummaryCellProps) => (
	<div className="flex min-w-0 flex-col gap-1.5 border-border px-4 py-3 not-last:border-b md:px-10 lg:px-6 lg:py-4 lg:not-first:border-l lg:not-last:border-b-0 lg:first:pl-10">
		<dt className="font-mono text-2xs tracking-[0.11em] text-faint-foreground uppercase">
			{label}
		</dt>
		<dd className={mono ? "font-mono text-sm break-words" : "text-sm"}>
			{children}
		</dd>
	</div>
);

const technicalResponsibleOf = (project: ProjectDetail) =>
	project.technicalResponsible
		? `${project.technicalResponsible.name}, CREA ${project.technicalResponsible.crea}`
		: "Não informado";

const extensionOf = (filename: string) =>
	filename.includes(".") ? filename.split(".").at(-1) : undefined;

interface SubmissionConfirmationPageProps {
	projectId: string;
}

/** Receipt shown after a submission; a resubmission keeps the protocol and lists what was fixed. */
export const SubmissionConfirmationPage = ({
	projectId,
}: SubmissionConfirmationPageProps) => {
	const projectQuery = useGetProject(projectId);
	const calculationQuery = useGetLatestCalculation(projectId);
	const submissionQuery = useGetSubmission(projectId);
	const findingsQuery = useGetFindingList(projectId);
	const memorialQuery = useGetMemorial(projectId, { enabled: false });

	const project = projectQuery.data?.data;
	const { isOwner } = useProjectPermissions(project);
	const calculation = calculationQuery.data?.data;
	const documents = submissionQuery.data?.data.documents ?? [];

	if (projectQuery.isError) {
		return (
			<EmptyState
				title="Não foi possível abrir o envio"
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
		);
	}

	if (!project) {
		return (
			<div aria-busy="true" className="flex flex-col gap-5 px-4 py-9 md:px-10">
				<Skeleton className="h-4 w-40" />
				<Skeleton className="h-10 w-96 max-w-full" />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	// Only the owner, right after sending, has a receipt to read.
	if (project.status !== "UNDER_REVIEW" || !project.submittedAt || !isOwner) {
		return <Navigate to="/projetos/$id" params={{ id: projectId }} replace />;
	}

	const resubmission = project.reviewCycle > 1;
	const version = padCount(project.reviewCycle);
	const sent = formatDateTime(project.submittedAt);
	const deadline = formatDate(
		dayjs(project.submittedAt).add(REVIEW_PERIOD_DAYS, "day").toISOString(),
	);

	const sentItems: ReceiptItem[] = [
		{
			key: "memorial",
			title: "Memorial descritivo do cálculo de demanda",
			meta: calculation ? "PDF" : undefined,
		},
		{
			key: "data",
			title: "Dados da edificação",
			meta: `${padCount(project.floors)} pavimentos`,
		},
		{
			key: "units",
			title: "Unidades consumidoras",
			meta: `${padCount(project.consumerUnitsCount)} unidades`,
		},
		{
			key: "calculation",
			title: "Memória de cálculo detalhada",
			meta: calculation
				? `${padCount(calculation.steps.length)} etapas`
				: undefined,
		},
		...documents.map((document) => ({
			key: document.id,
			title:
				document.type === "ART"
					? "ART do responsável técnico"
					: document.typeLabel,
			meta: extensionOf(document.filename),
		})),
	];

	const fixedItems: ReceiptItem[] = (findingsQuery.data?.data ?? [])
		.filter(({ status }) => status === "FIXED" || status === "CONTESTED")
		.map((finding) => ({
			key: finding.id,
			title: finding.description,
			description: finding.response
				? `${findingStageLabels[finding.stage]}: ${finding.response}`
				: findingStageLabels[finding.stage],
			meta: findingStatusLabels[finding.status],
		}));

	const nextSteps: ReceiptItem[] = [
		{
			key: "screening",
			title: "Triagem Automática",
			meta: "Concluída",
			description: resubmission
				? "Anexos e norma conferidos pelo sistema."
				: "Norma, tabelas e anexos conferidos pelo sistema.",
		},
		{
			key: "review",
			title: "Análise Técnica",
			meta: `Até ${deadline}`,
			description: resubmission
				? "O analista confere as correções e as respostas aos apontamentos."
				: "Um analista confere a memória de cálculo enviada.",
		},
		{
			key: "opinion",
			title: "Parecer",
			meta: "Aguardando",
			description: resubmission
				? "Aprovação ou novos apontamentos."
				: "Aprovação ou apontamentos para correção.",
		},
	];

	const downloadMemorial = async () => {
		const { data } = await memorialQuery.refetch();

		if (!data) {
			toast.error("Não foi possível baixar o memorial.");
			return;
		}

		downloadFile(data.blob, data.filename);
	};

	const showFixed = resubmission && fixedItems.length > 0;

	return (
		<div className="flex min-h-full flex-col">
			<dl
				aria-label="Resumo do projeto"
				className="grid border-b border-border lg:grid-cols-5"
			>
				<SummaryCell label="Projeto" mono={false}>
					{project.name}
				</SummaryCell>
				<SummaryCell label="Norma aplicada">
					{project.standards.length > 0
						? project.standards.map((standard, index) => (
								<span key={standard.name}>
									{index > 0 ? " e " : null}
									<span className="whitespace-nowrap">
										{standard.name} {standard.revision}
									</span>
								</span>
							))
						: "Não informada"}
				</SummaryCell>
				<SummaryCell label="Responsável técnico">
					{technicalResponsibleOf(project)}
				</SummaryCell>
				<SummaryCell
					label={resubmission ? "Demanda revisada" : "Demanda apurada"}
				>
					{project.demandKva === null
						? "Não calculada"
						: formatKva(project.demandKva, 1)}
				</SummaryCell>
				<SummaryCell label={resubmission ? "Reenviado em" : "Enviado em"}>
					<time dateTime={project.submittedAt}>{sent.date}</time>
				</SummaryCell>
			</dl>

			<div className="flex flex-col gap-5 border-b border-border px-4 py-9 md:px-10 lg:flex-row lg:items-start lg:justify-between">
				<div className="flex flex-col gap-3">
					<Eyebrow>
						{resubmission ? `Reenvio, versão ${version}` : "Etapa 05, envio"}
					</Eyebrow>
					<h1 className="font-heading text-3xl font-medium tracking-[-0.032em]">
						{resubmission
							? "Projeto Reenviado para Análise"
							: "Projeto Enviado para Análise"}
					</h1>
				</div>

				{resubmission ? (
					<p className="max-w-md text-sm text-muted-foreground">
						As correções foram registradas no mesmo protocolo e o projeto voltou
						à fila marcado como Reanálise. O analista recebe a versão {version}{" "}
						com o resumo das alterações e as respostas aos apontamentos.
					</p>
				) : null}
			</div>

			<div className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_440px]">
				<div className="flex min-w-0 flex-col gap-9.5 px-4 py-9 md:px-10">
					<SectionHeading>
						<span className="flex items-center gap-3">
							<Check aria-hidden="true" className="size-5" />
							<span>
								{resubmission ? "Reenviado em " : "Enviado em "}
								<time dateTime={project.submittedAt}>
									<span className="font-mono">{sent.date}</span> às{" "}
									<span className="font-mono">{sent.time}</span>
								</time>
							</span>
						</span>
					</SectionHeading>

					<section
						aria-labelledby="envio-itens"
						className="flex flex-col gap-3"
					>
						<h3 id="envio-itens" className="text-lg font-medium">
							{showFixed ? "O que Foi Corrigido" : "O que Foi Enviado"}
						</h3>
						<ReceiptList
							items={showFixed ? fixedItems : sentItems}
							marker={showFixed ? "check" : "index"}
						/>
					</section>

					{resubmission && project.changeSummary ? (
						<section
							aria-labelledby="envio-resumo"
							className="flex flex-col gap-3"
						>
							<h3 id="envio-resumo" className="text-lg font-medium">
								Resumo das Alterações
							</h3>
							<p className="text-sm whitespace-pre-line text-muted-foreground">
								{project.changeSummary}
							</p>
						</section>
					) : null}

					{calculation ? (
						<InlineActionButton
							className="mt-auto self-start underline"
							disabled={memorialQuery.isFetching}
							onClick={() => void downloadMemorial()}
						>
							{resubmission
								? `Baixar Memorial da v${version}`
								: "Baixar Memorial"}
						</InlineActionButton>
					) : null}
				</div>

				<div className="flex flex-col gap-9.5 border-t border-border px-4 py-9 md:px-10 lg:border-t-0 lg:border-l">
					<ConclusionField
						label={resubmission ? "Protocolo mantido" : "Protocolo gerado"}
						value={project.protocol}
						caption={
							resubmission
								? `Versão ${version} em análise, reanálise`
								: "Guarde este número para acompanhar o projeto"
						}
					/>

					<section aria-labelledby="envio-proximos-passos">
						<SectionHeading id="envio-proximos-passos">
							O que Acontece Agora
						</SectionHeading>
						<ReceiptList items={nextSteps} className="mt-1.5" />
					</section>
				</div>
			</div>

			<div className="flex justify-end border-t border-border px-4 py-4 md:px-10">
				<Button nativeButton={false} render={<Link to="/projetos" />}>
					Ir para Meus Projetos
					<ArrowRight aria-hidden="true" />
				</Button>
			</div>
		</div>
	);
};
