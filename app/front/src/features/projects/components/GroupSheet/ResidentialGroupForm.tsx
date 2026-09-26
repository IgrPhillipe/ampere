import { ControlledInput, ControlledSelect } from "@components/form";
import { useZodForm } from "@features/shared";
import type { ResidentialGroup } from "@services/consumer-units";
import { useEffect } from "react";

import { yesNoItems } from "../../constants";
import {
	type ResidentialGroupFormValues,
	residentialGroupFormSchema,
	toBoolean,
	toYesNo,
} from "../../schemas";
import { GroupFormFooter } from "./GroupFormFooter";
import { focusIssueField, type GroupFormProps } from "./group-form";

export const ResidentialGroupForm = ({
	group,
	focusField,
	isSaving,
	isDeleting,
	onSave,
	onCancel,
	onDelete,
}: GroupFormProps<ResidentialGroup>) => {
	const form = useZodForm(residentialGroupFormSchema, {
		name: group.name,
		quantity: group.quantity,
		usefulArea: group.usefulArea ?? null,
		bedrooms: group.bedrooms ?? null,
		unitLoadKw: group.unitLoadKw ?? null,
		compactUnit: toYesNo(group.compactUnit),
	});

	useEffect(() => focusIssueField(form, focusField), [form, focusField]);

	const submit = (values: ResidentialGroupFormValues) =>
		onSave({
			kind: "RESIDENTIAL",
			name: values.name,
			quantity: values.quantity,
			usefulArea: values.usefulArea,
			bedrooms: values.bedrooms,
			unitLoadKw: values.unitLoadKw,
			compactUnit: toBoolean(values.compactUnit),
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
					label="Quantidade de unidades"
					type="number"
					min={1}
					step={1}
					inputMode="numeric"
					required
					variant="underline"
				/>

				<ControlledInput
					control={form.control}
					name="usefulArea"
					label="Área útil (m²)"
					description="Define a demanda de cada unidade pelo Quadro 35."
					type="number"
					min={0}
					step="0.01"
					inputMode="decimal"
					variant="underline"
				/>

				<ControlledInput
					control={form.control}
					name="unitLoadKw"
					label="Carga instalada por unidade (kW)"
					description="Usada no cálculo individual do item 6.22.3."
					type="number"
					min={0}
					step="0.01"
					inputMode="decimal"
					variant="underline"
				/>

				<ControlledInput
					control={form.control}
					name="bedrooms"
					label="Quartos"
					type="number"
					min={0}
					step={1}
					inputMode="numeric"
					variant="underline"
				/>

				<ControlledSelect
					control={form.control}
					name="compactUnit"
					label="Smart, studio ou home studio?"
					description="Acima de 15 unidades, o fator de coincidência é fixo (item 6.25.1)."
					placeholder="Não informado"
					items={yesNoItems}
					variant="underline"
					fieldClassName="sm:col-span-2"
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
