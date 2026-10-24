import { InlineActionButton } from "@components/InlineActionButton";
import { Skeleton } from "@components/ui/skeleton";
import { padCount } from "@features/shared";
import { cn } from "@lib/utils";
import type { Calculation, CheckStatus } from "@services/calculation";
import {
	CircleCheck,
	CircleMinus,
	Info,
	type LucideIcon,
	TriangleAlert,
} from "lucide-react";

export type CalculationCheck = Calculation["checks"][number];

const checkStatusPresentation = {
	WARNING: {
		label: "Alerta",
		icon: TriangleAlert,
		className: "text-brand-sunset",
	},
	INFO: { label: "Informativo", icon: Info, className: "text-info" },
	PASSED: { label: "Conforme", icon: CircleCheck, className: "text-primary" },
	SKIPPED: {
		label: "Não Verificado",
		icon: CircleMinus,
		className: "text-muted-foreground",
	},
} as const satisfies Record<
	CheckStatus,
	{ label: string; icon: LucideIcon; className: string }
>;

const STATUS_ORDER: CheckStatus[] = ["WARNING", "INFO", "SKIPPED", "PASSED"];

interface AutomaticVerificationProps {
	checks?: CalculationCheck[];
	isLoading?: boolean;
	onCreateFinding?: (check: CalculationCheck) => void;
	className?: string;
}

export const AutomaticVerification = ({
	checks,
	isLoading = false,
	onCreateFinding,
	className,
}: AutomaticVerificationProps) => {
	const sorted = [...(checks ?? [])].sort(
		(a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status),
	);
	const warnings = sorted.filter((check) => check.status === "WARNING").length;

	return (
		<section aria-labelledby="verificacao-titulo" className={className}>
			<div className="flex items-baseline justify-between gap-4 border-b-2 border-foreground pb-3">
				<h2
					id="verificacao-titulo"
					className="text-lg font-semibold text-foreground"
				>
					Verificação Automática
				</h2>
				<span className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
					{padCount(warnings)} {warnings === 1 ? "alerta" : "alertas"}
				</span>
			</div>

			{isLoading || !checks ? (
				<ul aria-busy="true" className="flex flex-col">
					{Array.from({ length: 3 }, (_, index) => (
						<li key={index} className="border-b border-border py-3">
							<Skeleton className="h-4 w-80 max-w-full" />
						</li>
					))}
				</ul>
			) : sorted.length === 0 ? (
				<p className="py-4 text-sm text-muted-foreground">
					O cálculo não registrou verificações normativas.
				</p>
			) : (
				<ul className="flex flex-col">
					{sorted.map((check) => {
						const {
							label,
							icon: Icon,
							className: tone,
						} = checkStatusPresentation[check.status];

						return (
							<li
								key={check.code}
								className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-2 gap-y-2 border-b border-border py-3"
							>
								<Icon
									aria-hidden="true"
									className={cn("mt-0.5 size-4", tone)}
								/>
								<div className="flex min-w-0 flex-col gap-1">
									<span className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
										{label}
									</span>
									<p className="text-sm text-foreground">{check.message}</p>
								</div>

								{check.status === "WARNING" && onCreateFinding ? (
									<InlineActionButton
										onClick={() => onCreateFinding(check)}
										className="col-start-2 justify-self-start"
									>
										Virar Apontamento
									</InlineActionButton>
								) : null}
							</li>
						);
					})}
				</ul>
			)}
		</section>
	);
};
