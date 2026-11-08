import { SectionHeading } from "@components/SectionHeading";
import { Skeleton } from "@components/ui/skeleton";
import { formatDecimal, formatKva, padCount } from "@features/shared";
import type { Calculation } from "@services/calculation";
import type { GroupValidation } from "@services/consumer-units";
import type { ProjectDetail } from "@services/projects";
import type { SubmissionChecklist } from "@services/submission";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

import {
	buildingTypeLabels,
	type ProjectSectionKey,
	sectionPath,
	voltageLabels,
} from "../../constants";
import type { ProjectSectionState } from "../ProjectSectionNav";

const plural = (count: number, one: string, many: string) =>
	`${padCount(count)} ${count === 1 ? one : many}`;

interface SummaryCardProps {
	projectId: string;
	section: ProjectSectionKey;
	label: string;
	value?: ReactNode;
	detail?: ReactNode;
	state?: ProjectSectionState;
	/** Shown while the project is edited and the section is not ready. */
	pending?: string;
	/** Language, not a measurement: the value stays proportional. */
	textual?: boolean;
}

const SummaryCard = ({
	projectId,
	section,
	label,
	value,
	detail,
	state = {},
	pending,
	textual = false,
}: SummaryCardProps) => {
	const status = state.attention
		? plural(state.attention, "apontamento", "apontamentos")
		: state.outdated
			? "Desatualizado"
			: pending;
	const needsAction = Boolean(state.attention || state.outdated);

	return (
		<li className="flex">
			<Link
				to={sectionPath(section)}
				params={{ id: projectId }}
				className="group relative flex flex-1 flex-col gap-2 bg-card px-5 py-4 transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset"
			>
				{needsAction ? (
					<span
						aria-hidden="true"
						className="absolute inset-y-4 left-0 w-0.5 bg-attention"
					/>
				) : null}
				<span className="flex items-center justify-between gap-2 font-mono text-2xs tracking-[0.11em] text-faint-foreground uppercase">
					{label}
					<ArrowRight
						aria-hidden="true"
						className="size-3.5 text-foreground transition-transform group-hover:translate-x-0.5"
					/>
				</span>
				<span
					className={
						textual
							? "text-lg font-medium text-foreground"
							: "font-mono text-lg font-medium text-foreground"
					}
				>
					{value ?? <Skeleton className="h-7 w-32" />}
				</span>
				{detail ? (
					<span className="text-sm text-muted-foreground">{detail}</span>
				) : null}
				{status ? (
					<span
						className={
							needsAction
								? "mt-auto font-mono text-2xs tracking-[0.11em] text-foreground uppercase"
								: "mt-auto font-mono text-2xs tracking-[0.11em] text-faint-foreground uppercase"
						}
					>
						{status}
					</span>
				) : null}
			</Link>
		</li>
	);
};

interface ProjectSummaryProps {
	projectId: string;
	project?: ProjectDetail;
	validation?: GroupValidation;
	/** `null` when the project was never calculated, `undefined` while loading. */
	calculation?: Calculation | null;
	checklist?: SubmissionChecklist;
	sections: Partial<Record<ProjectSectionKey, ProjectSectionState>>;
	/** Whether the project is still being prepared, so missing parts are flagged. */
	editing: boolean;
	className?: string;
}

/** One card per section: what it holds and whether it still needs something. */
export const ProjectSummary = ({
	projectId,
	project,
	validation,
	calculation,
	checklist,
	sections,
	editing,
	className,
}: ProjectSummaryProps) => {
	const documents = checklist?.items.filter(
		(item) => item.key !== "CALCULATION",
	);
	const attached = documents?.filter((item) => item.completed).length ?? 0;

	return (
		<section aria-labelledby="resumo-titulo" className={className}>
			<SectionHeading id="resumo-titulo">Resumo do Projeto</SectionHeading>

			<ul className="grid gap-px border-b border-border bg-border @3xl:grid-cols-2 @6xl:grid-cols-4">
				<SummaryCard
					projectId={projectId}
					section="data"
					label="Dados da Edificação"
					textual
					value={project ? buildingTypeLabels[project.buildingType] : undefined}
					detail={
						project
							? `${plural(project.floors, "pavimento", "pavimentos")}, ${voltageLabels[project.voltage]}`
							: undefined
					}
					state={sections.data}
				/>
				<SummaryCard
					projectId={projectId}
					section="units"
					label="Unidades Consumidoras"
					value={
						validation
							? plural(validation.totalUnits, "unidade", "unidades")
							: undefined
					}
					detail={
						validation
							? `${plural(validation.totalGroups, "grupo", "grupos")}, ${formatDecimal(validation.totalDeclaredLoadKw, 1)} kW declarados`
							: undefined
					}
					state={sections.units}
					pending={
						editing && validation && !validation.canCalculate
							? validation.totalGroups === 0
								? "Nenhum grupo cadastrado"
								: plural(validation.pendingCount, "pendência", "pendências")
							: undefined
					}
				/>
				<SummaryCard
					projectId={projectId}
					section="calculation"
					label="Cálculo de Demanda"
					value={
						calculation === null
							? "Sem cálculo"
							: calculation
								? formatKva(calculation.totals.finalKva, 1)
								: undefined
					}
					detail={
						calculation
							? `${plural(calculation.checksCount, "conferência", "conferências")}, ${plural(calculation.warningsCount, "alerta", "alertas")}`
							: undefined
					}
					state={sections.calculation}
					pending={
						editing && calculation === null ? "Calcule a demanda" : undefined
					}
				/>
				<SummaryCard
					projectId={projectId}
					section="documents"
					label="Documentos"
					value={
						documents
							? `${padCount(attached)} de ${padCount(documents.length)}`
							: undefined
					}
					detail={documents ? "Anexos obrigatórios" : undefined}
					state={sections.documents}
					pending={
						editing && documents && attached < documents.length
							? "Anexe os documentos"
							: undefined
					}
				/>
			</ul>
		</section>
	);
};
