import { MultiFilterMenu } from "@components/MultiFilterMenu";
import {
	type NormativeStandardFilter,
	type NormativeTableStatus,
	normativeStandardFilterSchema,
	normativeTableStatusSchema,
} from "@services/normative-tables";

import { normativeStandardLabels } from "../../constants/normative-standard";
import { normativeTableStatusLabels } from "../../constants/normative-table-status";

const statusOptions = normativeTableStatusSchema.options.map((value) => ({
	value,
	label: normativeTableStatusLabels[value],
}));

const standardOptions = normativeStandardFilterSchema.options.map((value) => ({
	value,
	label: normativeStandardLabels[value],
}));

interface NormativeTableFilterControlsProps {
	status: NormativeTableStatus[];
	onStatusChange: (status: NormativeTableStatus[]) => void;
	standard: NormativeStandardFilter[];
	onStandardChange: (standard: NormativeStandardFilter[]) => void;
}

export const NormativeTableFilterControls = ({
	status,
	onStatusChange,
	standard,
	onStandardChange,
}: NormativeTableFilterControlsProps) => (
	<>
		<MultiFilterMenu
			label="Situação"
			allLabel="Todas"
			options={statusOptions}
			value={status}
			onValueChange={onStatusChange}
		/>
		<MultiFilterMenu
			label="Norma"
			allLabel="Todas"
			options={standardOptions}
			value={standard}
			onValueChange={onStandardChange}
		/>
	</>
);
