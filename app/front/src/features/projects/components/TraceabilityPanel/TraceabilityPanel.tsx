import { ConclusionField } from "@components/ConclusionField";
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
	return (
		<aside
			aria-labelledby="resultado-titulo"
			className={cn("flex flex-col px-6 py-8 md:px-9.5", className)}
		>
			<ConclusionField
				label={<span id="resultado-titulo">Resultado</span>}
				value={
					isLoading || !calculation ? undefined : (
						<span
							aria-live="polite"
							className="flex items-baseline gap-2 whitespace-nowrap"
						>
							{formatDecimal(calculation.totals.finalKva, 1)}
							<span className="font-sans text-lg font-normal tracking-normal opacity-85">
								kVA
							</span>
						</span>
					)
				}
				caption="Demanda total da edificação"
			>
				{isLoading || !calculation ? (
					<Skeleton className="h-14 w-40 bg-primary-foreground/20" />
				) : null}
			</ConclusionField>

			<dl className="mt-9.5 flex flex-col">
				{isLoading || !calculation
					? Array.from({ length: 7 }, (_, index) => (
							<div
								key={index}
								className="flex justify-between gap-3 border-b border-border py-2.5"
							>
								<Skeleton className="h-5 w-32" />
								<Skeleton className="h-5 w-20" />
							</div>
						))
					: rows.map(([label, value]) => (
							<div
								key={label}
								className="flex items-baseline justify-between gap-3 border-b border-border py-2.5"
							>
								<dt className="text-sm text-muted-foreground">{label}</dt>
								<dd className="text-right font-mono text-sm font-medium text-foreground">
									{value}
								</dd>
							</div>
						))}
			</dl>
		</aside>
	);
};
