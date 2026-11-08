import { ConclusionField } from "@components/ConclusionField";
import { InlineActionButton } from "@components/InlineActionButton";
import { Skeleton } from "@components/ui/skeleton";
import { padCount } from "@features/shared";
import { cn } from "@lib/utils";
import type {
	ConsumerUnitGroup,
	GroupValidation,
	ValidationIssue,
} from "@services/consumer-units";

const issueActionLabels = {
	REVIEW: "Corrigir Agora",
	MISSING_DATA: "Informar Dado",
} as const satisfies Record<ValidationIssue["severity"], string>;

interface ValidationPanelProps {
	groups: ConsumerUnitGroup[];
	validation?: GroupValidation;
	isLoading?: boolean;
	counterId: string;
	onOpenIssue: (group: ConsumerUnitGroup, issue: ValidationIssue) => void;
	className?: string;
}

export const ValidationPanel = ({
	groups,
	validation,
	isLoading = false,
	counterId,
	onOpenIssue,
	className,
}: ValidationPanelProps) => {
	const pending = groups.flatMap((group) =>
		group.issues.map((issue) => ({ group, issue })),
	);

	const summary =
		groups.length === 0
			? "Cadastre ao menos um grupo para liberar o cálculo."
			: "Nenhuma pendência. O cálculo está liberado.";

	return (
		<aside
			aria-labelledby="validacao-titulo"
			className={cn("flex flex-col px-6 py-8 md:px-9.5", className)}
		>
			<ConclusionField
				label={
					<span
						id="validacao-titulo"
						role="heading"
						aria-level={2}
						className="block font-sans text-lg font-medium tracking-[-0.018em] normal-case"
					>
						Validação em Tempo Real
					</span>
				}
				value={
					isLoading || !validation ? undefined : (
						<span aria-live="polite">{padCount(validation.pendingCount)}</span>
					)
				}
				caption={
					isLoading || !validation ? undefined : (
						<span id={counterId}>
							{validation.pendingCount === 1
								? "Pendência impede o cálculo"
								: "Pendências impedem o cálculo"}
						</span>
					)
				}
			>
				{isLoading || !validation ? (
					<Skeleton className="h-16 w-24 bg-primary-foreground/20" />
				) : pending.length === 0 ? (
					<p className="text-sm">{summary}</p>
				) : (
					<ol className="flex flex-col">
						{pending.map(({ group, issue }, index) => (
							<li
								key={`${group.id}-${issue.field}`}
								className="grid grid-cols-[2rem_minmax(0,1fr)] gap-y-1.5 border-t border-primary-foreground/40 py-5 last:border-b"
							>
								<span className="font-mono text-sm">{padCount(index + 1)}</span>

								<div className="flex items-baseline justify-between gap-3">
									<span className="text-base font-medium">{group.name}</span>
									<span className="font-mono text-2xs tracking-[0.11em] uppercase opacity-85">
										Bloqueia
									</span>
								</div>

								<p className="col-start-2 text-sm opacity-85">
									{issue.message}
								</p>

								<InlineActionButton
									onClick={() => onOpenIssue(group, issue)}
									className="col-start-2 mt-1.5 justify-self-start text-primary-foreground focus-visible:ring-primary-foreground"
								>
									{issueActionLabels[issue.severity]}
								</InlineActionButton>
							</li>
						))}
					</ol>
				)}
			</ConclusionField>
		</aside>
	);
};
