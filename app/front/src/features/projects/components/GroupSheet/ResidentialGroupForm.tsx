import { ControlledInput, ControlledSelect } from "@components/form";
import { formatDecimal, useZodForm } from "@features/shared";
import type { ResidentialGroup } from "@services/consumer-units";
import { CircleAlert } from "lucide-react";
import { useEffect } from "react";
import { useWatch } from "react-hook-form";

import { unitConnectionTypeItems, yesNoItems } from "../../constants";
import {
	type ResidentialGroupFormValues,
	residentialGroupFormSchema,
	toBoolean,
	toYesNo,
} from "../../schemas";
import { GroupFormFooter } from "./GroupFormFooter";
import { focusIssueField, type GroupFormProps } from "./group-form";
import { LoadItemsSection } from "./LoadItemsSection";
import {
	EMPTY_LOAD_ITEM,
	toLoadItemFormValues,
	toLoadItemPayload,
} from "./load-item";
import { unitInstalledKw, unitLoadNotice } from "./unit-load";

/** The back's `loads` are the form's `items`; the whole list, over 75 kW, focuses the first power. */
const toFormField = (field?: string) =>
	field === "loads" ? "items[0].power" : field?.replace(/^loads/, "items");

export const ResidentialGroupForm = ({
	group,
	focusField,
	readOnly,
	isNew,
	isSaving,
	isDeleting,
	onSave,
	onCancel,
	onDelete,
}: GroupFormProps<ResidentialGroup>) => {
	const loads = (group.loads ?? []).map(toLoadItemFormValues);
	const seedsFirstLoad =
		!readOnly && group.connectionType === "THREE_PHASE" && loads.length === 0;

	const form = useZodForm(residentialGroupFormSchema, {
		name: group.name,
		quantity: group.quantity,
		usefulArea: group.usefulArea ?? null,
		bedrooms: group.bedrooms ?? null,
		// For a three-phase group the API sends the sum of its loads, not a declared total.
		unitLoadKw:
			group.connectionType === "THREE_PHASE"
				? null
				: (group.unitLoadKw ?? null),
		compactUnit: toYesNo(group.compactUnit),
		connectionType: group.connectionType ?? undefined,
		items: seedsFirstLoad ? [EMPTY_LOAD_ITEM] : loads,
	});

	// `form.watch` is memoized by the React Compiler.
	const [connectionType, unitLoadKw, items] = useWatch({
		control: form.control,
		name: ["connectionType", "unitLoadKw", "items"],
	});
	const isThreePhase = connectionType === "THREE_PHASE";
	const installedKw = unitInstalledKw(connectionType, unitLoadKw, items ?? []);
	const notice = unitLoadNotice(connectionType, installedKw);
	const itemsError =
		form.formState.errors.items?.root?.message ??
		form.formState.errors.items?.message;

	const initialFocus = toFormField(focusField);
	useEffect(() => focusIssueField(form, initialFocus), [form, initialFocus]);

	// The back keeps one connection's data: loads (at least one) or the total load.
	useEffect(() => {
		if (readOnly) return;

		const current = form.getValues("items");
		if (connectionType === "THREE_PHASE") {
			form.setValue("unitLoadKw", null);
			if (current.length === 0) form.setValue("items", [EMPTY_LOAD_ITEM]);
		} else if (connectionType === "SINGLE_PHASE" && current.length > 0) {
			form.setValue("items", []);
		}
	}, [form, connectionType, readOnly]);

	const submit = (values: ResidentialGroupFormValues) => {
		const threePhase = values.connectionType === "THREE_PHASE";

		onSave({
			kind: "RESIDENTIAL",
			name: values.name,
			quantity: values.quantity,
			usefulArea: values.usefulArea,
			bedrooms: values.bedrooms,
			unitLoadKw: threePhase ? null : values.unitLoadKw,
			compactUnit: toBoolean(values.compactUnit),
			connectionType: values.connectionType,
			loads: threePhase ? values.items.map(toLoadItemPayload) : null,
		});
	};

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
				<div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
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

					<ControlledSelect
						control={form.control}
						name="connectionType"
						label="Ligação do apartamento"
						description="Trifásico detalha as cargas pelo item 6.27; monofásico declara a carga total."
						placeholder="Selecione a ligação"
						items={unitConnectionTypeItems}
						required
						variant="underline"
					/>

					<ControlledInput
						control={form.control}
						name="usefulArea"
						label={
							<>
								Área útil <span className="normal-case">(m²)</span>
							</>
						}
						description="Define a demanda de cada unidade pelo Quadro 35."
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

					{isThreePhase ? null : (
						<ControlledInput
							control={form.control}
							name="unitLoadKw"
							label={
								<>
									Carga instalada por unidade{" "}
									<span className="normal-case">(kW)</span>
								</>
							}
							description="Define a categoria da unidade (DIS-NOR-030, item 6.28.1)."
							type="number"
							min={0}
							step="0.01"
							inputMode="decimal"
							variant="underline"
						/>
					)}

					<ControlledSelect
						control={form.control}
						name="compactUnit"
						label="Smart, studio ou home studio?"
						description="Acima de 15 unidades, o fator de coincidência é fixo (item 6.25.1)."
						placeholder="Não informado"
						items={yesNoItems}
						variant="underline"
						fieldClassName={isThreePhase ? "sm:col-span-2" : undefined}
					/>
				</div>

				{isThreePhase ? (
					<LoadItemsSection
						control={form.control}
						readOnly={readOnly}
						title="Cargas do Apartamento"
						meta={
							<>
								Total{" "}
								<span className="ml-1.5 whitespace-nowrap text-foreground normal-case">
									{formatDecimal(installedKw)} kW
								</span>
							</>
						}
						emptyHint="Nenhuma carga informada. Adicione chuveiros, condicionadores de ar e demais cargas de uma unidade."
						descriptionPlaceholder="Ex.: Chuveiro"
						error={itemsError}
					/>
				) : null}

				{notice ? (
					<p
						role="status"
						className="flex gap-2.5 border-l-2 border-attention pl-3 text-sm text-foreground"
					>
						<CircleAlert
							aria-hidden="true"
							className="mt-0.5 size-4 shrink-0 text-attention"
						/>
						{notice}
					</p>
				) : null}
			</fieldset>

			<GroupFormFooter
				readOnly={readOnly}
				isNew={isNew}
				isSaving={isSaving}
				isDeleting={isDeleting}
				onCancel={onCancel}
				onDelete={onDelete}
			/>
		</form>
	);
};
