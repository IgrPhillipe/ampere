import type {
	ConsumerUnitGroup,
	ConsumerUnitGroupPayload,
} from "@services/consumer-units";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

/** O que cada formulario de tipo recebe do `GroupSheet`. */
export interface GroupFormProps<TGroup extends ConsumerUnitGroup> {
	group: TGroup;
	/** Campo da pendencia que abriu o painel, no formato da API: `items[0].power`. */
	focusField?: string;
	isSaving: boolean;
	isDeleting: boolean;
	onSave: (payload: ConsumerUnitGroupPayload) => void;
	onCancel: () => void;
	onDelete: () => void;
}

/** `items[0].power` da API vira `items.0.power`, o caminho do react-hook-form. */
export const toFieldPath = (field: string) =>
	field.replace(/\[(\d+)\]/g, ".$1");

/**
 * Leva o foco ao campo da pendencia. Depois de um quadro: o `Sheet` move o
 * foco para dentro dele ao abrir, e sem a espera ele venceria.
 */
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
