import { SectionHeading } from "@components/SectionHeading";
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
			<SectionHeading
				id="composicao-titulo"
				meta={
					calculatedKva === undefined ? undefined : (
						<>
							Soma das parcelas{" "}
							<span className="ml-1.5 text-foreground normal-case">
								{formatKva(calculatedKva)}
							</span>
						</>
					)
				}
			>
				Composição das Cargas
			</SectionHeading>

			{isLoading || !composition ? (
				<Skeleton className="mt-5 h-9 w-full" />
			) : (
				<>
					<div
						role="img"
						aria-label={`Participação de cada parcela na demanda calculada: ${description}`}
						className="mt-5 flex h-9 gap-0.5"
					>
						{shares.map((share) => (
							<span
								key={share.code}
								style={{ flexGrow: share.percent }}
								className={cn(
									"min-w-px basis-0",
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
								className="min-w-px basis-0 font-mono text-2xs tracking-[0.11em] text-faint-foreground"
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
