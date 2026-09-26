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

const dateOf = (value: string) => (
	<time dateTime={value} className="font-mono">
		{dayjs(value).format("DD.MM.YYYY")}
	</time>
);

const TableHistory = ({ table }: { table: NormativeTable }) => (
	<div className="flex flex-col gap-1 text-sm text-muted-foreground">
		<p>
			Cadastrada por {table.registeredBy} em {dateOf(table.registeredAt)}
		</p>
		{table.verifiedBy && table.verifiedAt ? (
			<p>
				Aprovada por {table.verifiedBy} em {dateOf(table.verifiedAt)}
			</p>
		) : (
			<p>Aguardando a aprovação de um revisor</p>
		)}
	</div>
);

const footerClassName = "flex-col gap-4 border-t border-border px-6 py-4";

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
	const isBusy = isSaving || isDeleting;

	return (
		<SheetFooter className={footerClassName}>
			{table ? <TableHistory table={table} /> : null}

			<div className="flex flex-wrap items-center justify-end gap-2">
				{table && !readOnly ? (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={onDelete}
						disabled={isBusy}
						className="mr-auto text-destructive"
					>
						<Trash2 aria-hidden="true" />
						{isDeleting ? "Excluindo..." : "Excluir"}
					</Button>
				) : null}

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

						{table && !awaitingReview ? (
							<Button
								type="button"
								onClick={onPublish}
								disabled={isBusy || !canPublish}
							>
								Aprovar e publicar
							</Button>
						) : null}
					</>
				)}
			</div>
		</SheetFooter>
	);
};
