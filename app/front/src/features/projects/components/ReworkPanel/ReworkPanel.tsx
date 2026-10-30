import { Skeleton } from "@components/ui/skeleton";
import { padCount } from "@features/shared";
import { cn } from "@lib/utils";
import type { ProjectRework } from "@services/project-events";

const titleId = "retrabalho-titulo";

const METRICS = [
	{ key: "submittedVersions", label: "Versões submetidas" },
	{ key: "reviewCycles", label: "Ciclos de análise" },
	{ key: "resolvedFindings", label: "Apontamentos resolvidos" },
	{ key: "openFindings", label: "Apontamentos em aberto" },
	{ key: "redoneCalculationSteps", label: "Etapas do cálculo refeitas" },
] as const satisfies readonly { key: keyof ProjectRework; label: string }[];

/** Only says something once there is a second version to compare with the first. */
const redoneNote = ({
	submittedVersions,
	redoneCalculationSteps,
}: ProjectRework) => {
	if (submittedVersions <= 1) return null;
	if (redoneCalculationSteps === 0)
		return "Nenhuma etapa do cálculo precisou ser refeita entre as versões.";

	return redoneCalculationSteps === 1
		? "Uma etapa do cálculo mudou de valor entre o primeiro envio e a versão atual."
		: `${redoneCalculationSteps} etapas do cálculo mudaram de valor entre o primeiro envio e a versão atual.`;
};

const cycleCaption = (cycleDays: number | null | undefined) =>
	cycleDays === null
		? "Aguardando o primeiro envio"
		: cycleDays === 1
			? "Dia desde o primeiro envio"
			: "Dias desde o primeiro envio";

interface ReworkPanelProps {
	rework?: ProjectRework;
	isLoading?: boolean;
	className?: string;
}

/** The approval cycle in days and the rework the protocol went through. */
export const ReworkPanel = ({
	rework,
	isLoading = false,
	className,
}: ReworkPanelProps) => {
	const loaded = isLoading ? undefined : rework;
	const note = loaded ? redoneNote(loaded) : null;

	return (
		<aside
			aria-label="Ciclo e retrabalho do protocolo"
			className={cn("flex flex-col gap-8 bg-card px-6 py-8 md:px-8", className)}
		>
			<div className="rounded-xs bg-primary px-6 py-5 text-primary-foreground">
				<h2 className="border-b border-primary-foreground/85 pb-3 font-mono text-xs tracking-[0.08em] text-primary-foreground/75 uppercase">
					Ciclo de Aprovação
				</h2>

				{loaded ? (
					<p className="mt-6 font-mono text-5xl font-medium tracking-tight">
						{loaded.cycleDays ?? "—"}
					</p>
				) : (
					<Skeleton className="mt-6 h-14 w-24 bg-primary-foreground/20" />
				)}

				<p className="mt-2 font-mono text-xs tracking-[0.08em] text-primary-foreground/75 uppercase">
					{cycleCaption(loaded?.cycleDays)}
				</p>
			</div>

			<section aria-labelledby={titleId} className="flex flex-col">
				<h2
					id={titleId}
					className="border-b-2 border-foreground pb-3 text-lg font-semibold text-foreground"
				>
					Retrabalho do Protocolo
				</h2>

				<dl className="flex flex-col">
					{METRICS.map(({ key, label }) => (
						<div
							key={key}
							className="flex items-center justify-between gap-4 border-b border-border py-3"
						>
							<dt className="text-sm text-foreground">{label}</dt>
							<dd className="font-mono text-sm font-medium text-foreground">
								{loaded ? (
									padCount(loaded[key])
								) : (
									<Skeleton className="h-4 w-6" />
								)}
							</dd>
						</div>
					))}
				</dl>

				{note ? (
					<p className="mt-3 text-xs text-muted-foreground">{note}</p>
				) : null}
			</section>
		</aside>
	);
};
