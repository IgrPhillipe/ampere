import { ControlledInput, ControlledSelect } from "@components/form";
import { useZodForm } from "@features/shared";
import type { LoadGroup } from "@services/consumer-units";
import { useEffect } from "react";

import { loadUsageItems } from "../../constants";
import { type LoadGroupFormValues, loadGroupFormSchema } from "../../schemas";
import { GroupFormFooter } from "./GroupFormFooter";
import { focusIssueField, type GroupFormProps } from "./group-form";
import { LoadItemsSection } from "./LoadItemsSection";
import {
	EMPTY_LOAD_ITEM,
	toLoadItemFormValues,
	toLoadItemPayload,
} from "./load-item";

export const LoadGroupForm = ({
	group,
	focusField,
	readOnly,
	isSaving,
	isDeleting,
	onSave,
	onCancel,
	onDelete,
}: GroupFormProps<LoadGroup>) => {
	// The back points the missing loads issue at the whole list.
	const startsOnFirstItem =
		!readOnly && focusField === "items" && group.items.length === 0;
	const initialFocus = startsOnFirstItem ? "items[0].description" : focusField;

	const form = useZodForm(loadGroupFormSchema, {
		name: group.name,
		quantity: group.quantity,
		usage: group.usage ?? null,
		items: startsOnFirstItem
			? [EMPTY_LOAD_ITEM]
			: group.items.map(toLoadItemFormValues),
	});

	useEffect(() => focusIssueField(form, initialFocus), [form, initialFocus]);

	const submit = (values: LoadGroupFormValues) =>
		onSave({
			kind: "LOAD",
			name: values.name,
			quantity: values.quantity,
			usage: values.usage,
			items: values.items.map(toLoadItemPayload),
		});

	return (
		<form
			noValidate
			onSubmit={form.handleSubmit(submit)}
			className="flex min-h-0 flex-1 flex-col"
		>
			<fieldset
				disabled={readOnly}
				className="flex min-w-0 flex-1 flex-col gap-8 overflow-y-auto px-6 py-6"
			>
				<div className="grid gap-x-6 gap-y-6 sm:grid-cols-[minmax(0,1fr)_11rem_6rem]">
					<ControlledInput
						control={form.control}
						name="name"
						label="Nome do grupo"
						required
						variant="underline"
					/>

					<ControlledSelect
						control={form.control}
						name="usage"
						label="Tipo de uso"
						placeholder="Selecione o tipo de uso"
						items={loadUsageItems}
						variant="underline"
					/>

					<ControlledInput
						control={form.control}
						name="quantity"
						label="Quantidade"
						type="number"
						min={1}
						step={1}
						inputMode="numeric"
						required
						variant="underline"
					/>
				</div>

				<LoadItemsSection
					control={form.control}
					readOnly={readOnly}
					title="Cargas Instaladas"
					emptyHint="Nenhuma carga informada. Adicione iluminação, motores, bombas e demais cargas do grupo."
				/>
			</fieldset>

			<GroupFormFooter
				readOnly={readOnly}
				isSaving={isSaving}
				isDeleting={isDeleting}
				onCancel={onCancel}
				onDelete={onDelete}
			/>
		</form>
	);
};
