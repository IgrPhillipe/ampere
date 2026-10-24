import { formatDate, padCount } from "@features/shared";
import dayjs from "@lib/dayjs";
import { cn } from "@lib/utils";

const REVIEW_PERIOD_DAYS = 30;

interface NextStepsPanelProps {
	submittedAt: string;
	className?: string;
}

export const NextStepsPanel = ({
	submittedAt,
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
			status: `Até ${formatDate(dayjs(submittedAt).add(REVIEW_PERIOD_DAYS, "day").toISOString())}`,
			description: "Um analista confere a memória de cálculo enviada.",
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
			className={cn("p-5", className)}
		>
			<h2
				id="next-steps-title"
				className="border-b-2 border-foreground pb-3 text-base font-semibold"
			>
				O que Acontece Agora
			</h2>
			<ol className="flex flex-col">
				{steps.map(({ title, status, description }, index) => (
					<li
						key={title}
						className="grid grid-cols-[2rem_minmax(0,1fr)] gap-y-1 border-b border-border py-3 last:border-b-0"
					>
						<span className="font-mono text-xs text-muted-foreground">
							{padCount(index + 1)}
						</span>
						<div className="flex flex-wrap items-baseline justify-between gap-2">
							<span className="text-sm font-medium">{title}</span>
							<span className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
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
