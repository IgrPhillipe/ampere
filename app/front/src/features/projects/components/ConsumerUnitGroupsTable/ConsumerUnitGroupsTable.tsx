import { DataTable } from "@components/DataTable";
import { SkeletonTable } from "@components/SkeletonTable";
import { formatDecimal } from "@features/shared";
import { cn } from "@lib/utils";
import type { ConsumerUnitGroup } from "@services/consumer-units";
import { type ReactNode, useMemo } from "react";
import type { Control } from "react-hook-form";

import type { GroupUsageType } from "../../constants";
import type { NewGroupFormValues } from "../../schemas";
import { ConsumerUnitGroupCards } from "./ConsumerUnitGroupCards";
import { createGroupColumns, type GroupColumnId } from "./group-columns";
import type { GroupRowActions } from "./group-row";
import { NewGroupRow } from "./NewGroupRow";

const groupColumnClassNames = {
	quantity: "w-20 text-right",
	load: "w-28 text-right",
	factor: "w-24 text-right",
	status: "w-36",
} satisfies Partial<Record<GroupColumnId, string>>;

interface ConsumerUnitGroupsTableProps extends GroupRowActions {
	groups: ConsumerUnitGroup[];
	totalLoadKw: number;
	isLoading?: boolean;
	empty: ReactNode;
	newGroupControl?: Control<NewGroupFormValues>;
	newGroupUsageType?: GroupUsageType;
	className?: string;
}

export const ConsumerUnitGroupsTable = ({
	groups,
	totalLoadKw,
	isLoading = false,
	empty,
	onOpenGroup,
	newGroupControl,
	newGroupUsageType,
	className,
}: ConsumerUnitGroupsTableProps) => {
	const columns = useMemo(
		() => createGroupColumns({ onOpenGroup, totalLoadKw }),
		[onOpenGroup, totalLoadKw],
	);

	if (isLoading) return <SkeletonTable columns={5} />;

	if (groups.length === 0 && !newGroupControl) return empty;

	return (
		<div className={cn("flex flex-col", className)}>
			<ConsumerUnitGroupCards
				groups={groups}
				totalLoadKw={totalLoadKw}
				onOpenGroup={onOpenGroup}
				newGroupControl={newGroupControl}
				newGroupUsageType={newGroupUsageType}
				className="md:hidden"
			/>

			<DataTable
				columns={columns}
				data={groups}
				columnClassNames={groupColumnClassNames}
				trailingRows={
					newGroupControl ? (
						<NewGroupRow
							control={newGroupControl}
							usageType={newGroupUsageType}
						/>
					) : undefined
				}
				className="hidden md:block"
			/>

			<p className="mt-4 self-end font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
				Carga instalada declarada
				<span className="ml-4 text-foreground">
					{formatDecimal(totalLoadKw, 1)}{" "}
					<span className="normal-case">kW</span>
				</span>
			</p>
		</div>
	);
};
