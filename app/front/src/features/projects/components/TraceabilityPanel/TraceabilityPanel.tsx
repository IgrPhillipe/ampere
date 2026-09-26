import { Skeleton } from "@components/ui/skeleton";
import { formatDecimal, formatKva } from "@features/shared";
import { cn } from "@lib/utils";
import type { Calculation } from "@services/calculation";

interface TraceabilityPanelProps {
	calculation?: Calculation;
	isLoading?: boolean;
	className?: string;
}

const OUTSIDE_TABLES = "Com a distribuidora";

const cable = ({ circuits, cableSectionMm2 }: Calculation["traceability"]) =>
	circuits === null || cableSectionMm2 === null
		? OUTSIDE_TABLES
		: `${circuits > 1 ? `${circuits} × ` : ""}${formatDecimal(cableSectionMm2, 0)} mm²`;

const breaker = ({ breakerAmps, breakerPoles }: Calculation["traceability"]) =>
	breakerAmps === null
		? OUTSIDE_TABLES
		: `${formatDecimal(breakerAmps, 0)} A ${breakerPoles}`;

export const TraceabilityPanel = ({
	calculation,
	isLoading = false,
	className,
}: TraceabilityPanelProps) => {
	const rows = calculation
		? [
				["Demanda calculada", formatKva(calculation.totals.calculatedKva)],
				[
					"Mínimo por tensão",
					calculation.totals.minimumKva === null
						? "Fora das Tabelas 1 e 2"
						: formatKva(calculation.totals.minimumKva),
				],
				["Tensão de fornecimento", calculation.traceability.voltage],
				[
					"Corrente projetada",
					`${formatDecimal(calculation.traceability.currentAmps, 1)} A`,
				],
				["Padrão de entrada", calculation.traceability.entranceStandard],
				["Proteção geral", breaker(calculation.traceability)],
				["Ramal de entrada", cable(calculation.traceability)],
			]
		: [];
	const warnings =
		calculation?.checks.filter((check) => check.status === "WARNING") ?? [];

	return (
		<aside
			aria-labelledby="resultado-titulo"
			className={cn("flex flex-col bg-card px-6 py-8 md:px-8", className)}
		>
			<div className="rounded-xs bg-primary px-6 py-5 text-primary-foreground">
				<h2
					id="resultado-titulo"
					className="border-b border-primary-foreground/85 pb-3 font-mono text-xs tracking-[0.08em] text-primary-foreground/75 uppercase"
				>
					Resultado
				</h2>

				{isLoading || !calculation ? (
					<Skeleton className="mt-9 h-16 w-40 bg-primary-foreground/20" />
				) : (
					<p
						aria-live="polite"
						className="mt-9 flex items-baseline gap-2 whitespace-nowrap"
					>
						<span className="font-mono text-6xl font-medium tracking-tight">
							{formatDecimal(calculation.totals.finalKva, 1)}
						</span>
						<span className="text-xl text-primary-foreground/75">kVA</span>
					</p>
				)}

				<p className="mt-2 font-mono text-xs tracking-[0.08em] text-primary-foreground/75 uppercase">
					Demanda total da edificação
				</p>
			</div>

			<dl className="mt-10 flex flex-col">
				{isLoading || !calculation
					? Array.from({ length: 7 }, (_, index) => (
							<div
								key={index}
								className="flex justify-between gap-3 border-t border-border py-2.5 last:border-b"
							>
								<Skeleton className="h-5 w-32" />
								<Skeleton className="h-5 w-20" />
							</div>
						))
					: rows.map(([label, value]) => (
							<div
								key={label}
								className="flex items-baseline justify-between gap-3 border-t border-border py-2 last:border-b"
							>
								<dt className="text-sm text-muted-foreground">{label}</dt>
								<dd className="text-right font-mono text-sm font-medium text-foreground">
									{value}
								</dd>
							</div>
						))}
			</dl>

			{warnings.length > 0 ? (
				<section aria-labelledby="alertas-titulo" className="mt-8">
					<h3
						id="alertas-titulo"
						className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase"
					>
						Alertas Normativos
					</h3>
					<ul className="mt-3 flex flex-col gap-3">
						{warnings.map((warning) => (
							<li
								key={warning.code}
								className="relative pl-3 text-sm text-foreground before:absolute before:top-1 before:left-0 before:h-4 before:w-0.5 before:bg-brand-sunset"
							>
								{warning.message}
							</li>
						))}
					</ul>
				</section>
			) : null}
		</aside>
	);
};
