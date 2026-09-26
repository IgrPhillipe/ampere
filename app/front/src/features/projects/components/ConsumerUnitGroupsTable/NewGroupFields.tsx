import { ControlledInput, ControlledSelect } from "@components/form";
import type { Control } from "react-hook-form";

import {
	GROUP_USAGE_TYPES,
	type GroupUsageType,
	groupUsageTypeItems,
} from "../../constants";
import type { NewGroupFormValues } from "../../schemas";
import { newGroupLoadLabel } from "./new-group";

interface NewGroupFieldsProps {
	control: Control<NewGroupFormValues>;
	usageType?: GroupUsageType;
}

const numericInputClassName = "text-right font-mono";

const hiddenLabel = (text: string) => <span className="sr-only">{text}</span>;

export const NameAndUsageFields = ({ control }: NewGroupFieldsProps) => (
	<div className="flex flex-col gap-1">
		<ControlledInput
			control={control}
			name="name"
			label={hiddenLabel("Nome do grupo")}
			placeholder="Nome do grupo"
			variant="underline"
			autoFocus
		/>

		<ControlledSelect
			control={control}
			name="usageType"
			label={hiddenLabel("Tipo de uso")}
			placeholder="Tipo de uso — selecionar"
			items={groupUsageTypeItems}
			variant="underline"
			className="text-xs"
		/>
	</div>
);

export const QuantityField = ({ control }: NewGroupFieldsProps) => (
	<ControlledInput
		control={control}
		name="quantity"
		label={hiddenLabel("Quantidade")}
		placeholder="00"
		type="number"
		min={1}
		step={1}
		inputMode="numeric"
		variant="underline"
		className={numericInputClassName}
	/>
);

export const LoadField = ({ control, usageType }: NewGroupFieldsProps) => {
	const label = newGroupLoadLabel(usageType);

	if (!label) {
		return (
			<span
				className="font-mono text-sm text-muted-foreground"
				title={
					usageType
						? `${GROUP_USAGE_TYPES[usageType].label}: a carga é a soma das cargas informadas no grupo.`
						: undefined
				}
			>
				{usageType ? "—" : "0,00"}
			</span>
		);
	}

	return (
		<ControlledInput
			control={control}
			name="load"
			label={hiddenLabel(label)}
			placeholder="0,00"
			type="number"
			min={0}
			step="0.01"
			inputMode="decimal"
			variant="underline"
			className={numericInputClassName}
		/>
	);
};
