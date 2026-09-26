import { ControlledInput, ControlledSelect } from "@components/form";
import { useZodForm } from "@features/shared";
import type { EvChargingGroup } from "@services/consumer-units";
import { useEffect } from "react";

import { evStationTypeItems, yesNoItems } from "../../constants";
import {
	type EvChargingGroupFormValues,
	evChargingGroupFormSchema,
	toBoolean,
	toYesNo,
} from "../../schemas";
import { GroupFormFooter } from "./GroupFormFooter";
import { focusIssueField, type GroupFormProps } from "./group-form";

export const EvChargingGroupForm = ({
	group,
	focusField,
	isSaving,
	isDeleting,
	onSave,
	onCancel,
	onDelete,
}: GroupFormProps<EvChargingGroup>) => {
	const form = useZodForm(evChargingGroupFormSchema, {
		name: group.name,
		quantity: group.quantity,
		powerPerPointKw: group.powerPerPointKw ?? null,
		incorporatedInVehicle: toYesNo(group.incorporatedInVehicle),
		loadManagement: toYesNo(group.loadManagement),
		stationType: group.stationType ?? null,
	});

	useEffect(() => focusIssueField(form, focusField), [form, focusField]);

	const submit = (values: EvChargingGroupFormValues) =>
		onSave({
			kind: "EV_CHARGING",
			name: values.name,
			quantity: values.quantity,
			powerPerPointKw: values.powerPerPointKw,
			incorporatedInVehicle: toBoolean(values.incorporatedInVehicle),
			loadManagement: toBoolean(values.loadManagement),
			stationType: values.stationType,
		});

	return (
		<form
			noValidate
			onSubmit={form.handleSubmit(submit)}
			className="flex min-h-0 flex-1 flex-col"
		>
			<div className="grid flex-1 content-start gap-x-6 gap-y-6 overflow-y-auto px-6 py-6 sm:grid-cols-2">
				<ControlledInput
					control={form.control}
					name="name"
					label="Nome do grupo"
					required
					variant="underline"
					fieldClassName="sm:col-span-2"
				/>

				<ControlledInput
					control={form.control}
					name="quantity"
					label="Pontos de recarga"
					type="number"
					min={1}
					step={1}
					inputMode="numeric"
					required
					variant="underline"
				/>

				<ControlledInput
					control={form.control}
					name="powerPerPointKw"
					label="Potência por ponto (kW)"
					description="Potência de placa do fabricante da estação."
					type="number"
					min={0}
					step="0.01"
					inputMode="decimal"
					variant="underline"
				/>

				<ControlledSelect
					control={form.control}
					name="loadManagement"
					label="Há sistema de gerenciamento de carga?"
					description="Altera a demanda de corte da proteção (itens 6.26.3 e 6.26.3.1)."
					placeholder="Não informado"
					items={yesNoItems}
					variant="underline"
					fieldClassName="sm:col-span-2"
				/>

				<ControlledSelect
					control={form.control}
					name="incorporatedInVehicle"
					label="Estação incorporada ao veículo?"
					description="Só nesse caso vale o padrão de 3,3 kW sem potência informada."
					placeholder="Não informado"
					items={yesNoItems}
					variant="underline"
				/>

				<ControlledSelect
					control={form.control}
					name="stationType"
					label="Tipo de posto"
					placeholder="Selecione o tipo de posto"
					items={evStationTypeItems}
					variant="underline"
				/>
			</div>

			<GroupFormFooter
				isSaving={isSaving}
				isDeleting={isDeleting}
				onCancel={onCancel}
				onDelete={onDelete}
			/>
		</form>
	);
};
