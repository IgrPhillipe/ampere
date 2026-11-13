import { SectionHeading } from "@components/SectionHeading";
import { formatDate, padCount } from "@features/shared";
import { cn } from "@lib/utils";

interface NextStepsPanelProps {
	reviewDeadline: string | null | undefined;
	reviewerName: string | null | undefined;
	className?: string;
}

export const NextStepsPanel = ({
	reviewDeadline,
	reviewerName,
	className,
}: NextStepsPanelProps) => {
	const steps = [
		{
			title: "Triagem Automática",
			status: "Concluída",
			description: "Norma, tabelas e anexos conferidos pelo sistema.",
		},
		{
			title: "Análise Técnica",
			status: reviewDeadline
				? `Retorno até ${formatDate(reviewDeadline)}`
				: "Prazo indisponível",
			description: reviewerName
				? `Analista: ${reviewerName}`
				: "Aguardando atribuição",
		},
		{
			title: "Parecer",
			status: "Aguardando",
			description: "Aprovação ou apontamentos para correção.",
		},
	];

	return (
		<section
			aria-labelledby="next-steps-title"
			className={cn("px-6 py-8 md:px-10", className)}
		>
			<SectionHeading id="next-steps-title">
				O que Acontece Agora
			</SectionHeading>
			<ol className="flex flex-col">
				{steps.map(({ title, status, description }, index) => (
					<li
						key={title}
						className="grid grid-cols-[2rem_minmax(0,1fr)] gap-y-1.5 border-b border-border py-3.5"
					>
						<span className="pt-px font-mono text-sm text-foreground">
							{padCount(index + 1)}
						</span>
						<div className="flex flex-wrap items-baseline justify-between gap-2">
							<span className="text-base font-medium">{title}</span>
							<span className="font-mono text-2xs tracking-[0.11em] text-faint-foreground uppercase">
								{status}
							</span>
						</div>
						<p className="col-start-2 text-sm text-muted-foreground">
							{description}
						</p>
					</li>
				))}
			</ol>
		</section>
	);
};
