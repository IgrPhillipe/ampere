import { SectionHeading } from "@components/SectionHeading";
import { Button } from "@components/ui/button";
import { Skeleton } from "@components/ui/skeleton";
import { formatDecimal, padCount } from "@features/shared";
import { cn } from "@lib/utils";
import type { Calculation } from "@services/calculation";
import type { ProjectDetail } from "@services/projects";
import type { Memorial } from "@services/submission";
import { Link } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { useEffect, useMemo } from "react";

/** The submission the official memorial was frozen in. */
export interface MemorialStamp {
	version: number;
	verificationCode: string | null;
}

interface MemorialPreviewProps {
	project?: ProjectDetail;
	/** Absent while the project is a draft or under correction: the PDF is a preview. */
	stamp?: MemorialStamp | null;
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
	stamp,
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
			className={cn("flex flex-col gap-5", className)}
		>
			<SectionHeading
				id="memorial-titulo"
				meta={stamp ? `Oficial · v${padCount(stamp.version)}` : "Prévia"}
			>
				{stamp ? "Memorial do Envio" : "Memorial Gerado"}
			</SectionHeading>

			{stamp ? (
				<p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm text-muted-foreground">
					<span>
						Este é o PDF gravado no envio da versão {stamp.version}: não é
						gerado de novo.
					</span>
					{stamp.verificationCode ? (
						<span>
							Código de verificação{" "}
							<Link
								to="/verificar-autenticidade"
								search={{ codigo: stamp.verificationCode }}
								className="font-mono text-foreground underline-offset-4 hover:underline"
							>
								{stamp.verificationCode}
							</Link>
							.
						</span>
					) : null}
				</p>
			) : (
				<p className="text-sm text-muted-foreground">
					Prévia sem validade e sem código de verificação. O memorial oficial é
					gravado no envio, com o protocolo, a versão e a data no rodapé.
				</p>
			)}

			<div className="border border-border bg-background px-7 py-6">
				<p className="font-mono text-2xs tracking-[0.11em] text-foreground uppercase">
					Memorial descritivo de cálculo de demanda
				</p>
				{project ? (
					<p className="mt-1.5 text-sm text-muted-foreground">
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
							className="flex items-center gap-4 border-b border-border py-3 text-sm text-foreground"
						>
							<span className="font-mono text-xs text-faint-foreground">
								{padCount(index + 1)}
							</span>
							{section}
						</li>
					))}
				</ol>

				<div className="mt-5 flex flex-wrap items-baseline justify-between gap-2">
					<p className="font-mono text-2xs tracking-[0.11em] text-faint-foreground uppercase">
						Demanda total apurada
					</p>
					{calculation ? (
						<p className="font-mono text-lg font-semibold">
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
					title={
						stamp
							? `Memorial oficial da versão ${stamp.version} em PDF`
							: "Prévia do memorial em PDF"
					}
					src={url}
					className="h-[36rem] w-full border border-border"
				/>
			)}

			<Button
				type="button"
				variant="link"
				className="h-auto w-fit px-0"
				disabled={!url}
				onClick={download}
			>
				<Download aria-hidden="true" />
				Baixar PDF
			</Button>
		</section>
	);
};
