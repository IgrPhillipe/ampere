import type {
	ConsumerUnitGroup,
	ConsumerUnitGroupPayload,
} from "@services/consumer-units";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

export interface GroupFormProps<TGroup extends ConsumerUnitGroup> {
	group: TGroup;
	focusField?: string;
	readOnly: boolean;
	isSaving: boolean;
	isDeleting: boolean;
	onSave: (payload: ConsumerUnitGroupPayload) => void;
	onCancel: () => void;
	onDelete: () => void;
}

export const toFieldPath = (field: string) =>
	field.replace(/\[(\d+)\]/g, ".$1");

/** Waits a frame: the Sheet moves focus into itself when it opens. */
export const focusIssueField = <T extends FieldValues>(
	form: UseFormReturn<T>,
	field?: string,
) => {
	if (!field) return undefined;

	const frame = requestAnimationFrame(() =>
		form.setFocus(toFieldPath(field) as Path<T>),
	);

	return () => cancelAnimationFrame(frame);
};
