import { Skeleton } from "@components/ui/skeleton";
import { formatDecimal, formatKva } from "@features/shared";
import { cn } from "@lib/utils";
import type { Calculation } from "@services/calculation";

import { demandSeriesClassNames } from "../../constants";

interface LoadCompositionProps {
	composition?: Calculation["composition"];
	calculatedKva?: number;
	isLoading?: boolean;
	className?: string;
}

export const LoadComposition = ({
	composition,
	calculatedKva,
	isLoading = false,
	className,
}: LoadCompositionProps) => {
	const shares = (composition ?? []).filter((share) => share.percent > 0);
	const description = shares
		.map((share) => `${share.code} ${formatDecimal(share.percent, 1)}%`)
		.join(", ");

	return (
		<section aria-labelledby="composicao-titulo" className={className}>
			<div className="flex items-baseline justify-between gap-4 border-b-2 border-foreground pb-3">
				<h2
					id="composicao-titulo"
					className="text-lg font-semibold text-foreground"
				>
					Composição das Cargas
				</h2>
				{calculatedKva === undefined ? null : (
					<span className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
						Soma das parcelas{" "}
						<span className="normal-case">{formatKva(calculatedKva)}</span>
					</span>
				)}
			</div>

			{isLoading || !composition ? (
				<Skeleton className="mt-4 h-9 w-full rounded-xs" />
			) : (
				<>
					<div
						role="img"
						aria-label={`Participação de cada parcela na demanda calculada: ${description}`}
						className="mt-4 flex h-9 gap-0.5"
					>
						{shares.map((share) => (
							<span
								key={share.code}
								style={{ flexGrow: share.percent }}
								className={cn(
									"min-w-px basis-0 first:rounded-l-xs last:rounded-r-xs",
									demandSeriesClassNames[share.code],
								)}
							/>
						))}
					</div>
					<div aria-hidden="true" className="mt-2 flex gap-0.5">
						{shares.map((share) => (
							<span
								key={share.code}
								style={{ flexGrow: share.percent }}
								className="min-w-px basis-0 font-mono text-xs text-muted-foreground"
							>
								{share.code} {formatDecimal(share.percent, 1)}%
							</span>
						))}
					</div>
				</>
			)}
		</section>
	);
};
