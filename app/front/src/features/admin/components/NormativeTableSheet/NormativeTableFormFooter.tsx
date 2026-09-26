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

interface HistoryEntryProps {
	label: string;
	person: string;
	at: string;
}

const HistoryEntry = ({ label, person, at }: HistoryEntryProps) => (
	<div className="flex min-w-0 flex-col gap-0.5">
		<dt className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
			{label}
		</dt>
		<dd className="truncate text-sm font-medium text-foreground">{person}</dd>
		<dd className="font-mono text-xs text-muted-foreground">
			<time dateTime={at}>{dayjs(at).format("DD.MM.YYYY")}</time>
		</dd>
	</div>
);

const TableHistory = ({ table }: { table: NormativeTable }) => (
	<dl className="flex min-w-0 flex-wrap gap-x-8 gap-y-3">
		<HistoryEntry
			label="Cadastro"
			person={table.registeredBy}
			at={table.registeredAt}
		/>
		{table.verifiedBy && table.verifiedAt ? (
			<HistoryEntry
				label="Revisão"
				person={table.verifiedBy}
				at={table.verifiedAt}
			/>
		) : null}
	</dl>
);

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
		<SheetFooter className="flex-row flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-border px-6 py-4">
			{table ? <TableHistory table={table} /> : null}

			<div className="ml-auto flex flex-wrap items-center justify-end gap-2">
				{table && !readOnly ? (
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
								Aprovar e Publicar
							</Button>
						) : null}
					</>
				)}
			</div>
		</SheetFooter>
	);
};
