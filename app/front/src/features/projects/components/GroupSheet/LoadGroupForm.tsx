import { ControlledInput, ControlledSelect } from "@components/form";
import { Button } from "@components/ui/button";
import { padCount, useZodForm } from "@features/shared";
import type { LoadGroup } from "@services/consumer-units";
import { Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useWatch } from "react-hook-form";

import {
	lampTechnologyItems,
	loadCategoryItems,
	loadUsageItems,
	powerUnitItems,
	yesNoItems,
} from "../../constants";
import {
	type LoadGroupFormValues,
	loadGroupFormSchema,
	toBoolean,
	toYesNo,
} from "../../schemas";
import { GroupFormFooter } from "./GroupFormFooter";
import { focusIssueField, type GroupFormProps } from "./group-form";

const EMPTY_ITEM: LoadGroupFormValues["items"][number] = {
	category: "LIGHTING_AND_OUTLETS",
	description: "",
	quantity: 1,
	power: null,
	powerUnit: "KW",
	lampTechnology: null,
	simultaneousStart: null,
};

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
	const form = useZodForm(loadGroupFormSchema, {
		name: group.name,
		quantity: group.quantity,
		usage: group.usage ?? null,
		items: group.items.map((item) => ({
			category: item.category,
			description: item.description,
			quantity: item.quantity,
			power: item.power ?? null,
			powerUnit: item.powerUnit,
			lampTechnology: item.lampTechnology ?? null,
			simultaneousStart: toYesNo(item.simultaneousStart),
		})),
	});

	const items = useFieldArray({ control: form.control, name: "items" });
	// `form.watch` is memoized by the React Compiler.
	const categories = useWatch({ control: form.control, name: "items" }).map(
		({ category }) => category,
	);

	useEffect(() => focusIssueField(form, focusField), [form, focusField]);

	const submit = (values: LoadGroupFormValues) =>
		onSave({
			kind: "LOAD",
			name: values.name,
			quantity: values.quantity,
			usage: values.usage,
			items: values.items.map((item) => ({
				...item,
				simultaneousStart: toBoolean(item.simultaneousStart),
			})),
		});

	return (
		<form
			noValidate
			onSubmit={form.handleSubmit(submit)}
			className="flex min-h-0 flex-1 flex-col"
		>
			<fieldset
				disabled={readOnly}
				className="flex flex-1 flex-col gap-8 overflow-y-auto px-6 py-6 min-w-0"
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

				<section className="flex flex-col gap-6">
					<div className="flex items-center justify-between border-b border-foreground pb-3">
						<h3 className="text-base font-semibold text-foreground">
							Cargas instaladas
						</h3>

						<Button
							type="button"
							variant="link"
							size="sm"
							onClick={() => items.append(EMPTY_ITEM)}
						>
							<Plus aria-hidden="true" />
							Adicionar carga
						</Button>
					</div>

					{items.fields.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							Nenhuma carga informada. Adicione iluminação, motores, bombas e
							demais cargas do grupo.
						</p>
					) : null}

					<ol className="flex flex-col gap-8">
						{items.fields.map((field, index) => (
							<li
								key={field.id}
								className="grid grid-cols-[2rem_minmax(0,1fr)] gap-y-6"
							>
								<span className="pt-6 font-mono text-sm text-muted-foreground">
									{padCount(index + 1)}
								</span>

								<div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
									<ControlledSelect
										control={form.control}
										name={`items.${index}.category`}
										label="Parcela"
										items={loadCategoryItems}
										variant="underline"
										fieldClassName="sm:col-span-2"
									/>

									<ControlledInput
										control={form.control}
										name={`items.${index}.description`}
										label="Descrição"
										placeholder="Ex.: Elevador"
										required
										variant="underline"
										fieldClassName="sm:col-span-2"
									/>

									<ControlledInput
										control={form.control}
										name={`items.${index}.quantity`}
										label="Quantidade"
										type="number"
										min={1}
										step={1}
										inputMode="numeric"
										required
										variant="underline"
									/>

									<div className="grid grid-cols-[minmax(0,1fr)_5rem] items-end gap-3">
										<ControlledInput
											control={form.control}
											name={`items.${index}.power`}
											label="Potência de placa"
											type="number"
											min={0}
											step="0.01"
											inputMode="decimal"
											variant="underline"
										/>

										<ControlledSelect
											control={form.control}
											name={`items.${index}.powerUnit`}
											label={<span className="sr-only">Unidade</span>}
											items={powerUnitItems}
											variant="underline"
										/>
									</div>

									{categories[index] === "LIGHTING_AND_OUTLETS" ? (
										<ControlledSelect
											control={form.control}
											name={`items.${index}.lampTechnology`}
											label="Tecnologia das lâmpadas"
											placeholder="Não informada"
											items={lampTechnologyItems}
											variant="underline"
											fieldClassName="sm:col-span-2"
										/>
									) : null}

									{categories[index] === "MOTORS" ? (
										<ControlledSelect
											control={form.control}
											name={`items.${index}.simultaneousStart`}
											label="Partida simultânea com outros motores?"
											placeholder="Não informado"
											items={yesNoItems}
											variant="underline"
											fieldClassName="sm:col-span-2"
										/>
									) : null}

									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() => items.remove(index)}
										className="justify-self-start text-destructive sm:col-span-2"
									>
										<Trash2 aria-hidden="true" />
										Remover carga
									</Button>
								</div>
							</li>
						))}
					</ol>
				</section>
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
