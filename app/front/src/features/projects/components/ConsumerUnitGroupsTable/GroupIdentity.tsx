import { cn } from "@lib/utils";
import type { ConsumerUnitGroup } from "@services/consumer-units";

interface GroupIdentityProps {
	group: ConsumerUnitGroup;
	/** Fatia do grupo na carga declarada, de 0 a 100. */
	share: number;
	onOpen: () => void;
	className?: string;
}

/**
 * Nome, resumo e medidor do grupo. O resumo vem pronto da API, com a tabela
 * da norma que se aplica ao tipo: o front nao monta texto normativo.
 */
export const GroupIdentity = ({
	group,
	share,
	onOpen,
	className,
}: GroupIdentityProps) => (
	<div className={cn("flex flex-col gap-1 whitespace-normal", className)}>
		<button
			type="button"
			onClick={onOpen}
			className="self-start text-left text-base font-medium text-foreground underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
		>
			{group.name}
		</button>

		<span className="text-xs text-muted-foreground">{group.summary}</span>

		<div
			role="meter"
			aria-label={`Participação de ${group.name} na carga declarada`}
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={Math.round(share)}
			className="mt-2 h-1 w-full max-w-xs bg-border"
		>
			<div className="h-full bg-primary" style={{ width: `${share}%` }} />
		</div>
	</div>
);
