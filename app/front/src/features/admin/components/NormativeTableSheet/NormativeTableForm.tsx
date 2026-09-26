import { ControlledInput, ControlledSelect } from "@components/form";
import { useAuthStore, useZodForm } from "@features/shared";
import {
	type NormativeTable,
	type NormativeTableCode,
	useCreateNormativeTable,
	useDeleteNormativeTable,
	usePublishNormativeTable,
	useUpdateNormativeTable,
} from "@services/normative-tables";
import { useEffect, useState } from "react";
import { useFormState, useWatch } from "react-hook-form";

import {
	type NormativeTableFormValues,
	normativeTableFormSchema,
	toNormativeTableFormValues,
	toNormativeTablePayload,
} from "../../schemas";
import { NormativeTableFormFooter } from "./NormativeTableFormFooter";
import { NormativeTableRowsEditor } from "./NormativeTableRowsEditor";
import { PublishNormativeTableDialog } from "./PublishNormativeTableDialog";

interface NormativeTableFormProps {
	table?: NormativeTable;
	codes: NormativeTableCode[];
	onCreated: (table: NormativeTable) => void;
	onClose: () => void;
}

export const NormativeTableForm = ({
	table,
	codes,
	onCreated,
	onClose,
}: NormativeTableFormProps) => {
	const createTable = useCreateNormativeTable();
	const updateTable = useUpdateNormativeTable();
	const publishTable = usePublishNormativeTable();
	const deleteTable = useDeleteNormativeTable();
	const [isPublishOpen, setPublishOpen] = useState(false);
	const email = useAuthStore((state) => state.user?.email);

	const form = useZodForm(
		normativeTableFormSchema,
		toNormativeTableFormValues(table),
	);
	const code = useWatch({ control: form.control, name: "code" });
	const { isDirty } = useFormState({ control: form.control });
	const definition = codes.find((entry) => entry.code === code);

	const isNew = table === undefined;
	const readOnly = table !== undefined && table.status !== "DRAFT";
	const codeItems = Object.fromEntries(
		codes.map((entry) => [
			entry.code,
			`${entry.identification}: ${entry.title}`,
		]),
	);
	const standardLabel = table
		? `${table.standard.name} ${table.standard.revision}`
		: (definition?.standard ?? "Escolha a tabela");

	// Prefills the catalog reference only when the person picks another code.
	useEffect(() => {
		const subscription = form.watch((values, { name }) => {
			if (name !== "code") return;

			const picked = codes.find((entry) => entry.code === values.code);

			if (!picked) return;

			form.setValue("identification", picked.identification);
			form.setValue("item", picked.item);
			form.setValue("page", picked.page);
			form.getValues("rows").forEach((_, index) => {
				form.setValue(`rows.${index}.key`, "");
			});
		});

		return () => subscription.unsubscribe();
	}, [codes, form]);

	const submit = (values: NormativeTableFormValues) => {
		if (!definition) return;

		if (definition.keys.length > 0) {
			const missing = values.rows.flatMap((row, index) =>
				row.key ? [] : [index],
			);

			missing.forEach((index) =>
				form.setError(`rows.${index}.key`, { message: "Selecione a chave." }),
			);

			if (missing.length > 0) return;
		}

		const payload = toNormativeTablePayload(values, definition);

		if (table) {
			updateTable.mutate(
				{ id: table.id, payload },
				{ onSuccess: () => form.reset(values) },
			);
		} else {
			createTable.mutate(payload, {
				onSuccess: ({ data }) => onCreated(data),
			});
		}
	};

	const remove = () => {
		if (!table) return;

		deleteTable.mutate(table.id, { onSuccess: onClose });
	};

	const publish = () => {
		if (!table) return;

		publishTable.mutate(table.id, {
			onSuccess: onClose,
			onSettled: () => setPublishOpen(false),
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
					<ControlledSelect
						control={form.control}
						name="code"
						label="Tabela"
						placeholder="Selecione a tabela da norma"
						items={codeItems}
						disabled={!isNew}
						required
						variant="underline"
						fieldClassName="min-w-0 sm:col-span-2"
						className="min-w-0 *:data-[slot=select-value]:truncate"
					/>

					<ControlledInput
						control={form.control}
						name="identification"
						label="Identificação"
						placeholder="Ex.: Quadro 35"
						required
						variant="underline"
					/>

					<div className="flex flex-col gap-2">
						<span className="text-xs leading-none tracking-wider text-muted-foreground uppercase">
							Norma
						</span>
						<span className="flex h-11 items-center border-b-2 border-transparent font-mono text-sm text-foreground">
							{standardLabel}
						</span>
					</div>

					<ControlledInput
						control={form.control}
						name="item"
						label="Item"
						placeholder="Ex.: Anexo I, item 1"
						required
						variant="underline"
					/>

					<ControlledInput
						control={form.control}
						name="page"
						label="Página"
						inputMode="numeric"
						required
						variant="underline"
					/>
				</div>

				<NormativeTableRowsEditor
					control={form.control}
					definition={definition}
					readOnly={readOnly}
				/>
			</fieldset>

			<NormativeTableFormFooter
				table={table}
				readOnly={readOnly}
				canPublish={!isDirty}
				awaitingReview={
					table?.registeredBy.toLowerCase() === email?.toLowerCase()
				}
				isSaving={createTable.isPending || updateTable.isPending}
				isDeleting={deleteTable.isPending}
				onCancel={onClose}
				onDelete={remove}
				onPublish={() => setPublishOpen(true)}
			/>

			<PublishNormativeTableDialog
				open={isPublishOpen}
				isPublishing={publishTable.isPending}
				onOpenChange={setPublishOpen}
				onConfirm={publish}
			/>
		</form>
	);
};
