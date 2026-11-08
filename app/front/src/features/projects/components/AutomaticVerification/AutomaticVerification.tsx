import { InlineActionButton } from "@components/InlineActionButton";
import { Skeleton } from "@components/ui/skeleton";
import { padCount } from "@features/shared";
import { cn } from "@lib/utils";
import type { Calculation, CheckStatus } from "@services/calculation";
import { Check } from "lucide-react";
import { useState } from "react";

export type CalculationCheck = Calculation["checks"][number];

const checkStatusLabels = {
	WARNING: "Alerta",
	INFO: "Informativo",
	PASSED: "Conforme",
	SKIPPED: "Não Verificado",
} as const satisfies Record<CheckStatus, string>;

const STATUS_ORDER: CheckStatus[] = ["WARNING", "INFO", "SKIPPED", "PASSED"];

interface AutomaticVerificationProps {
	checks?: CalculationCheck[];
	isLoading?: boolean;
	onCreateFinding?: (check: CalculationCheck) => void;
	className?: string;
}

const outcomeOf = (total: number, warnings: number) =>
	[
		`${padCount(total)} ${total === 1 ? "conferência" : "conferências"}`,
		warnings === 0
			? "nenhuma inconsistência"
			: `${padCount(warnings)} ${warnings === 1 ? "alerta" : "alertas"}`,
	].join(", ");

/** Quiet summary of the normative checks; only what needs a look is listed. */
export const AutomaticVerification = ({
	checks,
	isLoading = false,
	onCreateFinding,
	className,
}: AutomaticVerificationProps) => {
	const [showsAll, setShowsAll] = useState(false);
	const sorted = [...(checks ?? [])].sort(
		(a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status),
	);
	const warnings = sorted.filter((check) => check.status === "WARNING").length;
	const quiet = sorted.filter((check) => check.status !== "WARNING");
	const listed = sorted.filter(
		(check) => check.status === "WARNING" || showsAll,
	);

	return (
		<section
			aria-labelledby="verificacao-titulo"
			className={cn("flex flex-col border border-border px-5 py-3", className)}
		>
			{isLoading || !checks ? (
				<div aria-busy="true" className="flex flex-col gap-1.5 py-1.5">
					<Skeleton className="h-4 w-56" />
					<Skeleton className="h-3 w-40" />
				</div>
			) : (
				<div className="flex items-start gap-3">
					<Check aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
					<div className="flex min-w-0 flex-1 flex-col gap-0.5">
						<h2
							id="verificacao-titulo"
							className="text-sm font-medium text-foreground"
						>
							Verificação Automática Concluída
						</h2>
						<p className="font-mono text-2xs tracking-[0.11em] text-faint-foreground uppercase">
							{sorted.length === 0
								? "O cálculo não registrou verificações normativas"
								: outcomeOf(sorted.length, warnings)}
						</p>

						{quiet.length > 0 ? (
							<button
								type="button"
								aria-expanded={showsAll}
								onClick={() => setShowsAll((shows) => !shows)}
								className="mt-1.5 self-start text-xs font-medium text-foreground underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
							>
								{showsAll ? "Ocultar Conferências" : "Ver Conferências"}
							</button>
						) : null}
					</div>
				</div>
			)}

			{listed.length > 0 ? (
				<ul className="mt-3 flex flex-col border-t border-border-soft">
					{listed.map((check) => (
						<li
							key={check.code}
							className={cn(
								"flex flex-col gap-1.5 border-b border-border-soft py-3 pl-3 last:border-b-0",
								check.status === "WARNING" && "border-l-2 border-l-attention",
							)}
						>
							<span className="font-mono text-2xs tracking-[0.11em] text-faint-foreground uppercase">
								{checkStatusLabels[check.status]}
							</span>
							<p className="text-sm text-foreground">{check.message}</p>

							{check.status === "WARNING" && onCreateFinding ? (
								<InlineActionButton
									onClick={() => onCreateFinding(check)}
									className="self-start"
								>
									Virar Apontamento
								</InlineActionButton>
							) : null}
						</li>
					))}
				</ul>
			) : null}
		</section>
	);
};
