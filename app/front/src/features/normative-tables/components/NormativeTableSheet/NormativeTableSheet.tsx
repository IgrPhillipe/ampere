import { EmptyState } from "@components/EmptyState";
import { Button } from "@components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@components/ui/sheet";
import { Skeleton } from "@components/ui/skeleton";
import {
	type NormativeTable,
	useGetNormativeTable,
	useGetNormativeTableCodes,
} from "@services/normative-tables";
import { CircleAlert } from "lucide-react";

import { NormativeTableStatusBadge } from "../NormativeTableStatusBadge";
import { NormativeTableForm } from "./NormativeTableForm";

interface NormativeTableSheetProps {
	open: boolean;
	/** `null` opens an empty form for a new table. */
	tableId: string | null;
	onCreated: (table: NormativeTable) => void;
	onClose: () => void;
}

export const NormativeTableSheet = ({
	open,
	tableId,
	onCreated,
	onClose,
}: NormativeTableSheetProps) => {
	const codesQuery = useGetNormativeTableCodes();
	const tableQuery = useGetNormativeTable(tableId ?? "", {
		enabled: open && tableId !== null,
	});

	const table = tableId === null ? undefined : tableQuery.data?.data;
	const isLoading =
		codesQuery.isPending || (tableId !== null && tableQuery.isPending);
	const hasError =
		codesQuery.isError || (tableId !== null && tableQuery.isError);

	return (
		<Sheet
			open={open}
			onOpenChange={(next) => {
				if (!next) onClose();
			}}
		>
			<SheetContent className="w-full gap-0 bg-card sm:max-w-3xl">
				<SheetHeader className="border-b border-border px-6 py-6">
					<div className="flex flex-wrap items-center gap-3 pr-8">
						<SheetTitle className="font-heading text-xl">
							{tableId === null
								? "Nova Tabela"
								: (table?.identification ?? "Tabela")}
						</SheetTitle>

						{table ? <NormativeTableStatusBadge status={table.status} /> : null}
					</div>

					<SheetDescription>
						{tableId === null
							? "Cadastro de uma tabela normativa."
							: table?.title}
					</SheetDescription>
				</SheetHeader>

				{hasError ? (
					<div className="px-6 py-6">
						<EmptyState
							title="Não foi possível carregar a tabela"
							description="Verifique sua conexão e tente novamente."
							icon={CircleAlert}
							action={
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										void codesQuery.refetch();
										if (tableId !== null) void tableQuery.refetch();
									}}
								>
									Tentar Novamente
								</Button>
							}
						/>
					</div>
				) : isLoading ? (
					<div className="flex flex-col gap-6 px-6 py-6">
						<Skeleton className="h-11 w-full rounded-sm" />
						<div className="grid gap-6 sm:grid-cols-2">
							<Skeleton className="h-11 rounded-sm" />
							<Skeleton className="h-11 rounded-sm" />
						</div>
						<Skeleton className="h-48 w-full rounded-sm" />
					</div>
				) : (
					// `key` resets the form when another table opens or a draft is saved.
					<NormativeTableForm
						key={table?.id ?? "new"}
						table={table}
						codes={codesQuery.data?.data ?? []}
						onCreated={onCreated}
						onClose={onClose}
					/>
				)}
			</SheetContent>
		</Sheet>
	);
};
