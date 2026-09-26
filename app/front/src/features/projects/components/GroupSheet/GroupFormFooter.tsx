import { Button } from "@components/ui/button";
import { SheetFooter } from "@components/ui/sheet";
import { Trash2 } from "lucide-react";

interface GroupFormFooterProps {
	readOnly: boolean;
	isSaving: boolean;
	isDeleting: boolean;
	onCancel: () => void;
	onDelete: () => void;
}

export const GroupFormFooter = ({
	readOnly,
	isSaving,
	isDeleting,
	onCancel,
	onDelete,
}: GroupFormFooterProps) =>
	readOnly ? (
		<SheetFooter className="flex-row flex-wrap items-center justify-between gap-2 border-t border-border px-6 py-4">
			<p className="text-sm text-muted-foreground">
				Projeto enviado: as unidades não podem mais ser alteradas.
			</p>

			<Button type="button" variant="outline" onClick={onCancel}>
				Fechar
			</Button>
		</SheetFooter>
	) : (
		<SheetFooter className="flex-row flex-wrap items-center justify-between gap-2 border-t border-border px-6 py-4">
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

			<div className="ml-auto flex gap-2">
				<Button type="button" variant="ghost" onClick={onCancel}>
					Cancelar
				</Button>

				<Button type="submit" disabled={isSaving || isDeleting}>
					{isSaving ? "Salvando..." : "Salvar grupo"}
				</Button>
			</div>
		</SheetFooter>
	);
