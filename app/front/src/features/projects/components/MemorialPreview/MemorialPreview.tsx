import { Button } from "@components/ui/button";
import { Skeleton } from "@components/ui/skeleton";
import { formatDecimal, padCount } from "@features/shared";
import { cn } from "@lib/utils";
import type { Calculation } from "@services/calculation";
import type { ProjectDetail } from "@services/projects";
import type { Memorial } from "@services/submission";
import { Download } from "lucide-react";
import { useEffect, useMemo } from "react";

interface MemorialPreviewProps {
	project?: ProjectDetail;
	calculation?: Calculation;
	memorial?: Memorial;
	isLoading?: boolean;
	className?: string;
}

const SECTIONS = [
	"Identificação do projeto",
	"Unidades consumidoras",
	"Memória de cálculo",
	"Demanda prevista",
	"Normas aplicadas",
];

const protection = ({ traceability }: Calculation) =>
	[
		`${formatDecimal(traceability.currentAmps, 0)} A projetados`,
		traceability.breakerAmps === null
			? null
			: `proteção geral de ${formatDecimal(traceability.breakerAmps, 0)} A ${traceability.breakerPoles}`,
		traceability.cableSectionMm2 === null
			? null
			: `ramal de ${formatDecimal(traceability.cableSectionMm2, 0)} mm²`,
	]
		.filter(Boolean)
		.join(", ");

export const MemorialPreview = ({
	project,
	calculation,
	memorial,
	isLoading = false,
	className,
}: MemorialPreviewProps) => {
	const url = useMemo(
		() => (memorial ? URL.createObjectURL(memorial.blob) : undefined),
		[memorial],
	);

	useEffect(
		() => () => {
			if (url) URL.revokeObjectURL(url);
		},
		[url],
	);

	const download = () => {
		if (!url || !memorial) return;

		const link = document.createElement("a");
		link.href = url;
		link.download = memorial.filename;
		link.click();
	};

	return (
		<section
			aria-labelledby="memorial-titulo"
			className={cn("flex flex-col gap-6", className)}
		>
			<h2
				id="memorial-titulo"
				className="border-b-2 border-foreground pb-3 text-lg font-semibold text-foreground"
			>
				Memorial Gerado
			</h2>

			<div className="rounded-xs border border-border bg-background p-6">
				<p className="font-mono text-xs tracking-[0.08em] text-foreground uppercase">
					Memorial descritivo de cálculo de demanda
				</p>
				{project ? (
					<p className="mt-1 text-sm text-muted-foreground">
						{project.standards
							.map(({ name, revision }) => `${name} ${revision}`)
							.join(" e ")}
						, {project.name}
					</p>
				) : (
					<Skeleton className="mt-2 h-4 w-72" />
				)}

				<ol className="mt-5 border-t border-border">
					{SECTIONS.map((section, index) => (
						<li
							key={section}
							className="flex items-center gap-4 border-b border-border py-3 text-sm"
						>
							<span className="font-mono text-xs text-muted-foreground">
								{padCount(index + 1)}
							</span>
							{section}
						</li>
					))}
				</ol>

				<div className="mt-5 flex flex-wrap items-baseline justify-between gap-2">
					<p className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
						Demanda total apurada
					</p>
					{calculation ? (
						<p className="font-mono text-xl font-medium">
							{formatDecimal(calculation.totals.finalKva, 1)} kVA
						</p>
					) : (
						<Skeleton className="h-7 w-28" />
					)}
				</div>
				{calculation ? (
					<p className="mt-1 text-sm text-muted-foreground">
						{protection(calculation)}
					</p>
				) : null}
			</div>

			{isLoading || !url ? (
				<Skeleton className="h-[36rem] w-full" />
			) : (
				<iframe
					title="Prévia do memorial em PDF"
					src={url}
					className="h-[36rem] w-full rounded-xs border border-border"
				/>
			)}

			<Button
				type="button"
				variant="outline"
				className="w-fit"
				disabled={!url}
				onClick={download}
			>
				<Download aria-hidden="true" />
				Baixar PDF
			</Button>
		</section>
	);
};
