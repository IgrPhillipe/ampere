import { formatDecimal, padCount } from "@features/shared";
import { cn } from "@lib/utils";
import type { ConsumerUnitGroup } from "@services/consumer-units";
import type { Control } from "react-hook-form";

import type { GroupUsageType } from "../../constants";
import type { NewGroupFormValues } from "../../schemas";
import { GroupIdentity } from "./GroupIdentity";
import { GroupStatusLabel } from "./GroupStatusLabel";
import { type GroupRowActions, isPendingGroup, loadShare } from "./group-row";
import { LoadField, NameAndUsageFields, QuantityField } from "./NewGroupFields";
import { newGroupStatus } from "./new-group";

interface ConsumerUnitGroupCardsProps extends GroupRowActions {
	groups: ConsumerUnitGroup[];
	totalLoadKw: number;
	newGroupControl?: Control<NewGroupFormValues>;
	newGroupUsageType?: GroupUsageType;
	className?: string;
}

const Figure = ({ label, value }: { label: string; value: string }) => (
	<div className="flex flex-col gap-0.5">
		<dt className="font-mono text-xs tracking-[0.08em] text-muted-foreground">
			{label}
		</dt>
		<dd className="font-mono text-sm text-foreground">{value}</dd>
	</div>
);

export const ConsumerUnitGroupCards = ({
	groups,
	totalLoadKw,
	onOpenGroup,
	newGroupControl,
	newGroupUsageType,
	className,
}: ConsumerUnitGroupCardsProps) => (
	<ul className={cn("flex flex-col bg-card", className)}>
		{groups.map((group) => (
			<li
				key={group.id}
				className={cn(
					"relative flex flex-col gap-3 border-b border-border py-4",
					isPendingGroup(group) &&
						"before:absolute before:top-4 before:-left-4 before:h-6 before:w-0.5 before:bg-brand-sunset",
				)}
			>
				<GroupIdentity
					group={group}
					share={loadShare(group, totalLoadKw)}
					onOpen={() => onOpenGroup(group)}
				/>

				<dl className="flex flex-wrap gap-x-6 gap-y-2">
					<Figure label="QTD" value={padCount(group.quantity)} />
					<Figure
						label="CARGA kW"
						value={
							group.loadPerUnitKw == null
								? "Não informada"
								: formatDecimal(group.loadPerUnitKw)
						}
					/>
					<Figure label="FATOR" value="AUTO" />
				</dl>

				<GroupStatusLabel status={group.status} />
			</li>
		))}

		{newGroupControl ? (
			<li className="relative flex flex-col gap-3 border-b border-border bg-muted/40 px-4 py-4 before:absolute before:top-4 before:left-0 before:h-6 before:w-0.5 before:bg-brand-sunset">
				<NameAndUsageFields control={newGroupControl} />

				<div className="grid grid-cols-2 items-start gap-4">
					<div className="flex flex-col gap-1">
						<span
							aria-hidden="true"
							className="font-mono text-xs tracking-[0.08em] text-muted-foreground"
						>
							QTD
						</span>
						<QuantityField control={newGroupControl} />
					</div>

					<div className="flex flex-col gap-1">
						<span
							aria-hidden="true"
							className="font-mono text-xs tracking-[0.08em] text-muted-foreground"
						>
							CARGA kW
						</span>
						<LoadField
							control={newGroupControl}
							usageType={newGroupUsageType}
						/>
					</div>
				</div>

				<span className="font-mono text-xs tracking-[0.08em] text-foreground uppercase">
					{newGroupStatus(newGroupUsageType)}
				</span>
			</li>
		) : null}
	</ul>
);
