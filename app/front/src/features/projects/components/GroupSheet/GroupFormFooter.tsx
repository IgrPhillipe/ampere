import { Button } from "@components/ui/button";
import { SheetFooter } from "@components/ui/sheet";
import { Trash2 } from "lucide-react";

interface GroupFormFooterProps {
	isSaving: boolean;
	isDeleting: boolean;
	onCancel: () => void;
	onDelete: () => void;
}

export const GroupFormFooter = ({
	isSaving,
	isDeleting,
	onCancel,
	onDelete,
}: GroupFormFooterProps) => (
	<SheetFooter className="flex-row items-center justify-between border-t border-border px-6 py-4">
		<Button
			type="button"
			variant="ghost"
			size="sm"
			onClick={onDelete}
			disabled={isDeleting || isSaving}
			className="text-destructive"
		>
			<Trash2 aria-hidden="true" />
			{isDeleting ? "Excluindo..." : "Excluir grupo"}
		</Button>

		<div className="flex gap-2">
			<Button type="button" variant="ghost" onClick={onCancel}>
				Cancelar
			</Button>

			<Button type="submit" disabled={isSaving || isDeleting}>
				{isSaving ? "Salvando..." : "Salvar grupo"}
			</Button>
		</div>
	</SheetFooter>
);
