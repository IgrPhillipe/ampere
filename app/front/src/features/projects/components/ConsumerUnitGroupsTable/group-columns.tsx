import { createDataTableColumnHelper } from "@components/DataTable";
import { formatDecimal, padCount } from "@features/shared";
import { cn } from "@lib/utils";
import type { ConsumerUnitGroup } from "@services/consumer-units";

import { GroupIdentity } from "./GroupIdentity";
import { GroupStatusLabel } from "./GroupStatusLabel";
import { type GroupRowActions, isPendingGroup, loadShare } from "./group-row";

const columnHelper = createDataTableColumnHelper<ConsumerUnitGroup>();

/** Column ids, so `columnClassNames` does not accept a made-up key. */
export type GroupColumnId = "name" | "quantity" | "load" | "factor" | "status";

interface GroupColumnsOptions extends GroupRowActions {
	totalLoadKw: number;
}

export const createGroupColumns = ({
	onOpenGroup,
	totalLoadKw,
}: GroupColumnsOptions) =>
	columnHelper.columns([
		columnHelper.accessor("name", {
			header: "Grupo",
			cell: ({ row }) => (
				<div
					className={cn(
						"relative",
						isPendingGroup(row.original) &&
							"before:absolute before:top-1/2 before:-left-4 before:h-6 before:w-0.5 before:-translate-y-1/2 before:bg-brand-sunset",
					)}
				>
					<GroupIdentity
						group={row.original}
						share={loadShare(row.original, totalLoadKw)}
						onOpen={() => onOpenGroup(row.original)}
					/>
				</div>
			),
		}),
		columnHelper.accessor("quantity", {
			header: "Qtd",
			cell: ({ row }) => (
				<span className="font-mono text-sm text-foreground">
					{padCount(row.original.quantity)}
				</span>
			),
		}),
		columnHelper.accessor("loadPerUnitKw", {
			id: "load",
			// A unidade fica em minusculas, como no prototipo: "kW", nao "KW".
			header: () => (
				<>
					Carga <span className="normal-case">kW</span>
				</>
			),
			cell: ({ row }) => (
				<span className="font-mono text-sm text-foreground">
					{row.original.loadPerUnitKw == null
						? "—"
						: formatDecimal(row.original.loadPerUnitKw)}
				</span>
			),
		}),
		// O fator e resultado do calculo (US04). Ate la a coluna existe, como no
		// prototipo, e diz o que o sistema vai fazer: aplicar sozinho.
		columnHelper.display({
			id: "factor",
			header: "Fator",
			cell: () => (
				<span className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
					Auto
				</span>
			),
		}),
		columnHelper.accessor("status", {
			header: "Situação",
			cell: ({ row }) => <GroupStatusLabel status={row.original.status} />,
		}),
	]);
