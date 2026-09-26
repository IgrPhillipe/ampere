import { Skeleton } from "@components/ui/skeleton";
import { padCount } from "@features/shared";
import { cn } from "@lib/utils";
import type {
	ConsumerUnitGroup,
	GroupValidation,
	ValidationIssue,
} from "@services/consumer-units";

import { InlineActionButton } from "../ProjectsTable/InlineActionButton";

/** O que o atalho de cada pendencia diz: confirmar um valor ou informar um que falta. */
const issueActionLabels = {
	REVIEW: "Corrigir agora",
	MISSING_DATA: "Informar dado",
} as const satisfies Record<ValidationIssue["severity"], string>;

interface ValidationPanelProps {
	groups: ConsumerUnitGroup[];
	validation?: GroupValidation;
	isLoading?: boolean;
	/** Alvo do `aria-describedby` do "Calcular demanda" enquanto desabilitado. */
	counterId: string;
	onOpenIssue: (group: ConsumerUnitGroup, issue: ValidationIssue) => void;
	className?: string;
}

/**
 * O painel "Validação em tempo real" do prototipo H3. As pendencias e as
 * mensagens vem prontas da API: a regra normativa mora no back, e o painel so
 * leva quem preenche ate o campo a corrigir.
 */
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
			className={cn(
				"flex flex-col bg-primary px-6 py-8 text-primary-foreground md:px-8",
				className,
			)}
		>
			<h2
				id="validacao-titulo"
				className="border-b border-primary-foreground pb-3 text-lg font-semibold"
			>
				Validação em tempo real
			</h2>

			{isLoading || !validation ? (
				<Skeleton className="mt-8 h-16 w-24 bg-primary-foreground/20" />
			) : (
				<div className="mt-8" aria-live="polite">
					<p className="font-mono text-6xl font-medium tracking-tight">
						{padCount(validation.pendingCount)}
					</p>

					<p
						id={counterId}
						className="mt-2 font-mono text-xs tracking-[0.08em] uppercase"
					>
						{validation.pendingCount === 1
							? "Pendência impede o cálculo"
							: "Pendências impedem o cálculo"}
					</p>

					{pending.length === 0 ? (
						<p className="mt-8 text-sm">{summary}</p>
					) : null}
				</div>
			)}

			{pending.length > 0 ? (
				<ol className="mt-8 flex flex-col">
					{pending.map(({ group, issue }, index) => (
						<li
							key={`${group.id}-${issue.field}`}
							className="grid grid-cols-[2rem_minmax(0,1fr)] gap-y-2 border-t border-primary-foreground/40 py-5 last:border-b"
						>
							<span className="font-mono text-sm">{padCount(index + 1)}</span>

							<div className="flex items-baseline justify-between gap-4">
								<span className="text-base font-medium">{group.name}</span>
								<span className="font-mono text-xs tracking-[0.08em] uppercase">
									Bloqueia
								</span>
							</div>

							<p className="col-start-2 text-sm">{issue.message}</p>

							<InlineActionButton
								onClick={() => onOpenIssue(group, issue)}
								className="col-start-2 justify-self-start text-sm font-medium text-primary-foreground focus-visible:ring-primary-foreground"
							>
								{issueActionLabels[issue.severity]}
							</InlineActionButton>
						</li>
					))}
				</ol>
			) : null}
		</aside>
	);
};
