import { Button } from "@components/ui/button";
import { SheetFooter } from "@components/ui/sheet";
import { Trash2 } from "lucide-react";

interface NormativeTableFormFooterProps {
	canDelete: boolean;
	readOnly: boolean;
	canPublish: boolean;
	awaitingReview: boolean;
	isSaving: boolean;
	isDeleting: boolean;
	onCancel: () => void;
	onDelete: () => void;
	onPublish: () => void;
}

export const NormativeTableFormFooter = ({
	canDelete,
	readOnly,
	canPublish,
	awaitingReview,
	isSaving,
	isDeleting,
	onCancel,
	onDelete,
	onPublish,
}: NormativeTableFormFooterProps) => {
	const isBusy = isSaving || isDeleting;

	return (
		<SheetFooter className="flex-row flex-wrap items-center justify-between gap-2 border-t border-border px-6 py-4">
			{canDelete && !readOnly ? (
				<Button
					type="button"
					variant="destructive-ghost"
					size="sm"
					onClick={onDelete}
					disabled={isBusy}
				>
					<Trash2 aria-hidden="true" />
					{isDeleting ? "Excluindo..." : "Excluir"}
				</Button>
			) : null}

			<div className="ml-auto flex flex-wrap items-center gap-2">
				{readOnly ? (
					<Button type="button" variant="outline" onClick={onCancel}>
						Fechar
					</Button>
				) : (
					<>
						<Button type="button" variant="ghost" onClick={onCancel}>
							Cancelar
						</Button>

						<Button type="submit" variant="outline" disabled={isBusy}>
							{isSaving ? "Salvando..." : "Salvar"}
						</Button>

						{canDelete && !awaitingReview ? (
							<Button
								type="button"
								onClick={onPublish}
								disabled={isBusy || !canPublish}
							>
								Aprovar e Publicar
							</Button>
						) : null}
					</>
				)}
			</div>
		</SheetFooter>
	);
};
