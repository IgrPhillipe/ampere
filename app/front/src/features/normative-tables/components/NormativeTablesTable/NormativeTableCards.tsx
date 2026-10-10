import { cn } from "@lib/utils";
import type { NormativeTable } from "@services/normative-tables";

import { NormativeTableStatusBadge } from "../NormativeTableStatusBadge";

interface NormativeTableCardsProps {
	tables: NormativeTable[];
	onOpen: (table: NormativeTable) => void;
	className?: string;
}

export const NormativeTableCards = ({
	tables,
	onOpen,
	className,
}: NormativeTableCardsProps) => (
	<ul className={cn("flex flex-col bg-card", className)}>
		{tables.map((table) => (
			<li key={table.id} className="border-b border-border last:border-b-0">
				<button
					type="button"
					onClick={() => onOpen(table)}
					className="flex w-full flex-col gap-3 px-6 py-4 text-left transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset"
				>
					<div className="flex w-full items-start justify-between gap-3">
						<div className="flex min-w-0 flex-col gap-1">
							<span className="font-semibold text-foreground">
								{table.identification}
							</span>
							<span className="text-xs text-muted-foreground">
								{table.title}
							</span>
						</div>

						<NormativeTableStatusBadge status={table.status} />
					</div>

					<span className="font-mono text-xs text-muted-foreground">
						{table.standard.name} {table.standard.revision}, {table.item}, p.{" "}
						{table.page}
					</span>

					<dl className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
						<div className="flex gap-1.5">
							<dt>Linhas</dt>
							<dd className="font-mono">{table.rowCount}</dd>
						</div>

						<div className="flex gap-1.5">
							<dt>Cadastro</dt>
							<dd>{table.registeredBy}</dd>
						</div>

						<div className="flex gap-1.5">
							<dt>Revisão</dt>
							<dd>{table.verifiedBy ?? "Pendente"}</dd>
						</div>
					</dl>
				</button>
			</li>
		))}
	</ul>
);
