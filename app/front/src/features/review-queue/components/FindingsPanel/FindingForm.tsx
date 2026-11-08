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
import type { FindingStage } from "@services/project-review";
import { useEffect, useRef } from "react";
import { useWatch } from "react-hook-form";

import { type FindingFormValues, findingFormSchema } from "../../schemas";
import type { FindingEditor } from "../../types";

const EMPTY_VALUES: Partial<FindingFormValues> = {
	reference: "",
	description: "",
	standardItem: "",
};

const BLANK_STAGE = "" as FindingStage;

interface FindingFormProps {
	editor: FindingEditor;
	currentStage?: FindingStage;
	referenceOptions: FindingReferenceOptions;
	isPending: boolean;
	autoFocus?: boolean;
	onSubmit: (values: FindingFormValues) => void;
	onCancel: () => void;
}

export const FindingForm = ({
	editor,
	currentStage,
	referenceOptions,
	isPending,
	autoFocus = false,
	onSubmit,
	onCancel,
}: FindingFormProps) => {
	const form = useZodForm(findingFormSchema, {
		...EMPTY_VALUES,
		stage: currentStage,
		...editor.values,
	});
	const stage = useWatch({ control: form.control, name: "stage" });
	const description = useWatch({ control: form.control, name: "description" });
	const referenceLabel = stage ? findingReferenceLabels[stage] : null;
	const references = stage ? referenceOptions[stage] : {};
	const hasReferences = Object.keys(references).length > 0;
	const isEditing = editor.mode === "edit";
	const previousStage = useRef(stage);
	const syncedStage = useRef(currentStage);

	useEffect(() => {
		if (autoFocus) form.setFocus("description");
	}, [autoFocus, form]);

	useEffect(() => {
		if (previousStage.current === stage) return;

		previousStage.current = stage;
		form.setValue("reference", "");
	}, [form, stage]);

	useEffect(() => {
		if (syncedStage.current === currentStage) return;
		if (isEditing || autoFocus || description.trim() !== "") return;

		syncedStage.current = currentStage;
		// An undefined value would fall back to the stage the field mounted with.
		form.reset({ ...form.getValues(), stage: currentStage ?? BLANK_STAGE });
	}, [autoFocus, currentStage, description, form, isEditing]);

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

				<Button type="submit" variant="outline" disabled={isPending}>
					{isEditing ? "Salvar Apontamento" : "Registrar Apontamento"}
				</Button>
			</div>
		</form>
	);
};
