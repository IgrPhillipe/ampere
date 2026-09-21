import { createDataTableColumnHelper } from "@components/DataTable";
import dayjs from "@lib/dayjs";
import { cn } from "@lib/utils";
import type { Project } from "@services/projects";

import { projectStatusLabels } from "../../constants";
import { InlineActionButton } from "./InlineActionButton";

const columnHelper = createDataTableColumnHelper<Project>();

/** Ids das colunas, para `columnClassNames` nao aceitar chave inventada. */
export type ProjectColumnId = "name" | "status" | "createdAt" | "updatedAt";

/** Reprovado com pendencia oferece "Ver apontamentos". */
const isRejectedWithFindings = (project: Project) =>
	project.status === "REJECTED" && project.pendingCount > 0;

const hasProjectAction = (project: Project) =>
	project.status === "AWAITING_SUBMISSION" || isRejectedWithFindings(project);

interface ProjectColumnActions {
	onViewFindings: (project: Project) => void;
	onResumeSubmission: (project: Project) => void;
}

/**
 * Objeto, nao dois parametros posicionais: os dois callbacks tem a mesma
 * assinatura, entao trocar a ordem compilava e quebrava em silencio — "Ver
 * apontamentos" abriria a retomada de envio.
 */
export const createProjectColumns = ({
	onViewFindings,
	onResumeSubmission,
}: ProjectColumnActions) =>
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
		columnHelper.accessor("status", {
			header: "Situação",
			cell: ({ row }) => (
				<div className="flex min-w-40 flex-col items-start gap-1.5">
					<span className="font-mono text-xs tracking-[0.08em] text-foreground uppercase">
						{projectStatusLabels[row.original.status]}
						{isRejectedWithFindings(row.original) ? (
							<>
								{" — "}
								{row.original.pendingCount}{" "}
								{row.original.pendingCount === 1 ? "pendência" : "pendências"}
							</>
						) : null}
					</span>
					{isRejectedWithFindings(row.original) ? (
						<InlineActionButton onClick={() => onViewFindings(row.original)}>
							Ver apontamentos
						</InlineActionButton>
					) : row.original.status === "AWAITING_SUBMISSION" ? (
						<InlineActionButton
							onClick={() => onResumeSubmission(row.original)}
						>
							Retomar e enviar
						</InlineActionButton>
					) : null}
				</div>
			),
		}),
		columnHelper.accessor("createdAt", {
			header: "Criado em",
			cell: ({ row }) => (
				<time
					dateTime={row.original.createdAt}
					className="font-mono text-xs text-foreground"
				>
					{dayjs(row.original.createdAt).format("DD.MM.YYYY")}
				</time>
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
