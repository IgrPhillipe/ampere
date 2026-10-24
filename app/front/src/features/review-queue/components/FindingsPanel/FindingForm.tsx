import {
	ControlledInput,
	ControlledSelect,
	ControlledTextarea,
} from "@components/form";
import { Button } from "@components/ui/button";
import {
	type FindingReferenceOptions,
	findingReferenceLabels,
	findingSeverityLabels,
	findingStageLabels,
} from "@features/projects";
import { useZodForm } from "@features/shared";
import { useEffect } from "react";
import { useWatch } from "react-hook-form";

import { type FindingFormValues, findingFormSchema } from "../../schemas";
import type { FindingEditor } from "../../types";

const EMPTY_VALUES: Partial<FindingFormValues> = {
	reference: "",
	description: "",
	standardItem: "",
};

interface FindingFormProps {
	editor: FindingEditor;
	referenceOptions: FindingReferenceOptions;
	isPending: boolean;
	autoFocus?: boolean;
	onSubmit: (values: FindingFormValues) => void;
	onCancel: () => void;
}

export const FindingForm = ({
	editor,
	referenceOptions,
	isPending,
	autoFocus = false,
	onSubmit,
	onCancel,
}: FindingFormProps) => {
	const form = useZodForm(findingFormSchema, {
		...EMPTY_VALUES,
		...editor.values,
	});
	const stage = useWatch({ control: form.control, name: "stage" });
	const referenceLabel = stage ? findingReferenceLabels[stage] : null;
	const references = stage ? referenceOptions[stage] : {};
	const hasReferences = Object.keys(references).length > 0;
	const isEditing = editor.mode === "edit";

	useEffect(() => {
		if (autoFocus) form.setFocus("description");
	}, [autoFocus, form]);

	return (
		<form
			noValidate
			aria-label={isEditing ? "Editar apontamento" : "Novo apontamento"}
			onSubmit={form.handleSubmit(onSubmit)}
			className="flex flex-col gap-4"
		>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
				<ControlledSelect
					control={form.control}
					name="severity"
					label="Gravidade"
					items={findingSeverityLabels}
					required
				/>

				<ControlledSelect
					control={form.control}
					name="stage"
					label="Seção"
					items={findingStageLabels}
					required
				/>
			</div>

			{referenceLabel ? (
				<ControlledSelect
					control={form.control}
					name="reference"
					label={referenceLabel}
					items={references}
					placeholder={hasReferences ? "Seção inteira" : "Nada a vincular"}
					disabled={!hasReferences}
				/>
			) : null}

			<ControlledTextarea
				control={form.control}
				name="description"
				label="Descrição"
				placeholder="O que o projetista precisa corrigir"
				maxLength={2000}
				required
			/>

			<ControlledInput
				control={form.control}
				name="standardItem"
				label="Item da norma"
				placeholder="DIS-NOR-053, item 6.27.3"
				maxLength={255}
			/>

			<div className="flex justify-end gap-2">
				{isEditing || autoFocus ? (
					<Button type="button" variant="ghost" onClick={onCancel}>
						Cancelar
					</Button>
				) : null}

				<Button type="submit" disabled={isPending}>
					{isEditing ? "Salvar Apontamento" : "Registrar Apontamento"}
				</Button>
			</div>
		</form>
	);
};
