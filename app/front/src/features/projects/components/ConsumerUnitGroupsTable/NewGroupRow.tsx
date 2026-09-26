import { TableCell, TableRow } from "@components/ui/table";
import type { Control } from "react-hook-form";

import type { GroupUsageType } from "../../constants";
import type { NewGroupFormValues } from "../../schemas";
import { LoadField, NameAndUsageFields, QuantityField } from "./NewGroupFields";
import { newGroupStatus } from "./new-group";

interface NewGroupRowProps {
	control: Control<NewGroupFormValues>;
	usageType?: GroupUsageType;
}

export const NewGroupRow = ({ control, usageType }: NewGroupRowProps) => (
	<TableRow className="bg-muted/40 align-top hover:bg-muted/40">
		<TableCell className="whitespace-normal">
			{/* Marker inside the cell: a `::before` on the `tr` becomes an extra cell. */}
			<div className="relative before:absolute before:top-2 before:-left-4 before:h-6 before:w-0.5 before:bg-brand-sunset">
				<NameAndUsageFields control={control} />
			</div>
		</TableCell>

		<TableCell className="text-right whitespace-normal">
			<QuantityField control={control} />
		</TableCell>

		<TableCell className="text-right whitespace-normal">
			<LoadField control={control} usageType={usageType} />
		</TableCell>

		<TableCell className="text-right">
			<span className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
				Auto
			</span>
		</TableCell>

		<TableCell>
			<span className="font-mono text-xs tracking-[0.08em] text-foreground uppercase">
				{newGroupStatus(usageType)}
			</span>
		</TableCell>
	</TableRow>
);
