import { createDataTableColumnHelper } from "@components/DataTable";
import dayjs from "@lib/dayjs";
import { cn } from "@lib/utils";
import type { Project } from "@services/projects";

import { ProjectStatusSummary } from "./ProjectStatusSummary";
import { hasProjectAction, type ProjectRowActions } from "./project-row";

const columnHelper = createDataTableColumnHelper<Project>();

/** Ids das colunas, para `columnClassNames` nao aceitar chave inventada. */
export type ProjectColumnId = "name" | "status" | "createdAt" | "updatedAt";

/**
 * Objeto, nao dois parametros posicionais: os dois callbacks tem a mesma
 * assinatura, entao trocar a ordem compilava e quebrava em silencio — "Ver
 * apontamentos" abriria a retomada de envio.
 */
export const createProjectColumns = ({
	onViewFindings,
	onResumeSubmission,
}: ProjectRowActions) =>
	columnHelper.columns([
		columnHelper.accessor("name", {
			header: "Projeto",
			cell: ({ row }) => (
				// Sem `min-w`: a tabela e `table-fixed`, entao um minimo aqui nao
				// alarga a coluna — vaza para fora dela e escreve por cima da
				// vizinha. O texto quebra em linha e a coluna fica com a sobra.
				<div
					className={cn(
						"relative flex flex-col gap-1 whitespace-normal",
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
				<div className="whitespace-normal">
					<ProjectStatusSummary
						project={row.original}
						onViewFindings={onViewFindings}
						onResumeSubmission={onResumeSubmission}
					/>
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
					className="text-sm whitespace-normal text-muted-foreground"
				>
					{dayjs(row.original.updatedAt).fromNow()}
				</time>
			),
		}),
	]);
