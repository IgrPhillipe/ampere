import { Button } from "@components/ui/button";
import { SheetFooter } from "@components/ui/sheet";
import dayjs from "@lib/dayjs";
import type { NormativeTable } from "@services/normative-tables";
import { Trash2 } from "lucide-react";

interface NormativeTableFormFooterProps {
	table?: NormativeTable;
	readOnly: boolean;
	canPublish: boolean;
	awaitingReview: boolean;
	isSaving: boolean;
	isDeleting: boolean;
	onCancel: () => void;
	onDelete: () => void;
	onPublish: () => void;
}

const footerClassName =
	"flex-row flex-wrap items-center justify-between gap-2 border-t border-border px-6 py-4";

export const NormativeTableFormFooter = ({
	table,
	readOnly,
	canPublish,
	awaitingReview,
	isSaving,
	isDeleting,
	onCancel,
	onDelete,
	onPublish,
}: NormativeTableFormFooterProps) => {
	if (readOnly) {
		return (
			<SheetFooter className={footerClassName}>
				<p className="text-sm text-muted-foreground">
					{table?.verifiedBy && table.verifiedAt
						? `Aprovada por ${table.verifiedBy} em ${dayjs(table.verifiedAt).format("DD.MM.YYYY")}.`
						: "Tabela publicada: as linhas não podem mais ser alteradas."}
				</p>

				<Button type="button" variant="outline" onClick={onCancel}>
					Fechar
				</Button>
			</SheetFooter>
		);
	}

	const isBusy = isSaving || isDeleting;

	return (
		<SheetFooter className={footerClassName}>
			{table ? (
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={onDelete}
					disabled={isBusy}
					className="text-destructive"
				>
					<Trash2 aria-hidden="true" />
					{isDeleting ? "Excluindo..." : "Excluir"}
				</Button>
			) : null}

			{table && awaitingReview ? (
				<p className="text-sm text-muted-foreground">
					Rascunho aguardando a aprovação de um revisor.
				</p>
			) : null}

			<div className="ml-auto flex flex-wrap justify-end gap-2">
				<Button type="button" variant="ghost" onClick={onCancel}>
					Cancelar
				</Button>

				<Button type="submit" variant="outline" disabled={isBusy}>
					{isSaving ? "Salvando..." : "Salvar"}
				</Button>

				{table && !awaitingReview ? (
					<Button
						type="button"
						onClick={onPublish}
						disabled={isBusy || !canPublish}
					>
						Aprovar e publicar
					</Button>
				) : null}
			</div>
		</SheetFooter>
	);
};
