import { createDataTableColumnHelper } from "@components/DataTable";
import dayjs from "@lib/dayjs";
import { cn } from "@lib/utils";
import type { Project } from "@services/projects";
import { ArrowRight } from "lucide-react";

const columnHelper = createDataTableColumnHelper<Project>();

const projectStatusLabels: Record<Project["status"], string> = {
	DRAFT: "Rascunho",
	AWAITING_SUBMISSION: "Aguardando envio",
	UNDER_REVIEW: "Em análise",
	REJECTED: "Reprovado",
	APPROVED: "Aprovado",
};

const hasProjectAction = (project: Project) =>
	project.status === "AWAITING_SUBMISSION" ||
	(project.status === "REJECTED" && project.pendingCount > 0);

export const createProjectColumns = (
	onViewFindings: (project: Project) => void,
	onResumeSubmission: (project: Project) => void,
) =>
	columnHelper.columns([
		columnHelper.accessor("name", {
			header: "Projeto",
			cell: ({ row }) => (
				<div
					className={cn(
						"relative flex min-w-72 flex-col gap-1 whitespace-normal",
						hasProjectAction(row.original) &&
							"before:absolute before:top-1/2 before:-left-4 before:h-6 before:w-0.5 before:-translate-y-1/2 before:bg-brand-sunset",
					)}
				>
					<span className="font-semibold text-foreground">
						{row.original.name}
					</span>
					<span className="text-xs text-muted-foreground">
						{row.original.address} — {row.original.municipality}
					</span>
					<span className="font-mono text-xs text-muted-foreground">
						Protocolo {row.original.protocol}
					</span>
				</div>
			),
		}),
		columnHelper.display({
			id: "units",
			header: "UCs",
			cell: () => <span aria-label="Dado ainda não disponível">—</span>,
		}),
		columnHelper.display({
			id: "demand",
			header: "Demanda",
			cell: () => <span aria-label="Dado ainda não disponível">—</span>,
		}),
		columnHelper.accessor("status", {
			header: "Situação",
			cell: ({ row }) => (
				<div className="flex min-w-40 flex-col items-start gap-1.5">
					<span className="font-mono text-xs tracking-[0.08em] text-foreground uppercase">
						{projectStatusLabels[row.original.status]}
						{row.original.status === "REJECTED" &&
						row.original.pendingCount > 0 ? (
							<>
								{" — "}
								{row.original.pendingCount}{" "}
								{row.original.pendingCount === 1 ? "pendência" : "pendências"}
							</>
						) : null}
					</span>
					{row.original.status === "REJECTED" &&
					row.original.pendingCount > 0 ? (
						<button
							type="button"
							onClick={() => onViewFindings(row.original)}
							className="inline-flex items-center gap-2 text-xs text-foreground underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
						>
							Ver apontamentos
							<ArrowRight className="size-3.5" aria-hidden="true" />
						</button>
					) : row.original.status === "AWAITING_SUBMISSION" ? (
						<button
							type="button"
							onClick={() => onResumeSubmission(row.original)}
							className="inline-flex items-center gap-2 text-xs text-foreground underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
						>
							Retomar e enviar
							<ArrowRight className="size-3.5" aria-hidden="true" />
						</button>
					) : null}
				</div>
			),
		}),
		columnHelper.accessor("createdAt", {
			header: "Criado em",
			cell: ({ row }) =>
				row.original.createdAt ? (
					<time
						dateTime={row.original.createdAt}
						className="font-mono text-xs text-foreground"
					>
						{dayjs(row.original.createdAt).format("DD.MM.YYYY")}
					</time>
				) : (
					<span aria-label="Dado ainda não disponível">—</span>
				),
		}),
		columnHelper.accessor("updatedAt", {
			header: "Atualizado",
			cell: ({ row }) => (
				<time
					dateTime={row.original.updatedAt}
					title={dayjs(row.original.updatedAt).format("DD/MM/YYYY HH:mm")}
					className="text-sm text-muted-foreground"
				>
					{dayjs(row.original.updatedAt).fromNow()}
				</time>
			),
		}),
	]);
