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
	<TableRow className="bg-muted align-top hover:bg-muted">
		<TableCell className="whitespace-normal">
			<NameAndUsageFields control={control} />
		</TableCell>

		<TableCell className="text-right whitespace-normal">
			<QuantityField control={control} />
		</TableCell>

		<TableCell className="text-right whitespace-normal">
			<LoadField control={control} usageType={usageType} />
		</TableCell>

		<TableCell className="text-right">
			<span className="font-mono text-2xs tracking-[0.11em] text-faint-foreground uppercase">
				Auto
			</span>
		</TableCell>

		<TableCell>
			<span className="font-mono text-2xs tracking-[0.11em] text-foreground uppercase">
				{newGroupStatus(usageType)}
			</span>
		</TableCell>
	</TableRow>
);
