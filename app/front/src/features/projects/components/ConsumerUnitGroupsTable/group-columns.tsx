import { createDataTableColumnHelper } from "@components/DataTable";
import { formatDecimal, padCount } from "@features/shared";
import { cn } from "@lib/utils";
import type { ConsumerUnitGroup } from "@services/consumer-units";
import type { Finding } from "@services/project-review";

import { FindingBadge } from "../FindingBadge";
import { GroupIdentity } from "./GroupIdentity";
import { GroupStatusLabel } from "./GroupStatusLabel";
import { type GroupRowActions, isPendingGroup, loadShare } from "./group-row";

const columnHelper = createDataTableColumnHelper<ConsumerUnitGroup>();

/** Column ids, so `columnClassNames` does not accept a made-up key. */
export type GroupColumnId = "name" | "quantity" | "load" | "factor" | "status";

interface GroupColumnsOptions extends GroupRowActions {
	totalLoadKw: number;
	findings: Finding[];
}

export const createGroupColumns = ({
	onOpenGroup,
	totalLoadKw,
	findings,
}: GroupColumnsOptions) =>
	columnHelper.columns([
		columnHelper.accessor("name", {
			header: "Grupo",
			cell: ({ row }) => (
				<div
					className={cn(
						"relative",
						isPendingGroup(row.original) &&
							"before:absolute before:top-1/2 before:-left-4 before:h-6 before:w-0.5 before:-translate-y-1/2 before:bg-attention",
					)}
				>
					<GroupIdentity
						group={row.original}
						share={loadShare(row.original, totalLoadKw)}
						onOpen={() => onOpenGroup(row.original)}
					/>
					<FindingBadge
						findings={findings.filter(
							(finding) => finding.consumerUnitGroupId === row.original.id,
						)}
						target={`grupo-${row.original.id}`}
						// Sits on the row's gutter, where the pending bar goes.
						className="absolute top-1/2 -left-4 -translate-y-1/2"
					/>
				</div>
			),
		}),
		columnHelper.accessor("quantity", {
			header: "Qtd",
			cell: ({ row }) => (
				<span className="font-mono text-sm font-medium text-foreground">
					{padCount(row.original.quantity)}
				</span>
			),
		}),
		columnHelper.accessor("loadPerUnitKw", {
			id: "load",
			header: () => (
				<>
					Carga <span className="normal-case">kW</span>
				</>
			),
			cell: ({ row }) => (
				<span className="font-mono text-sm font-medium text-foreground">
					{row.original.loadPerUnitKw == null
						? "Não informada"
						: formatDecimal(row.original.loadPerUnitKw)}
				</span>
			),
		}),
		columnHelper.display({
			id: "factor",
			header: "Fator",
			cell: () => (
				<span className="font-mono text-2xs tracking-[0.11em] text-faint-foreground uppercase">
					Auto
				</span>
			),
		}),
		columnHelper.accessor("status", {
			header: "Situação",
			cell: ({ row }) => <GroupStatusLabel status={row.original.status} />,
		}),
	]);
