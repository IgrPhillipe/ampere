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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import {
	type NormativeTable,
	useGetNormativeTable,
	useGetNormativeTableCodes,
} from "@services/normative-tables";
import { CircleAlert } from "lucide-react";

import { NormativeTableHistory } from "../NormativeTableHistory";
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
	const codes = codesQuery.data?.data ?? [];

	// `key` resets the form when another table opens or a draft is saved.
	const form = (
		<NormativeTableForm
			key={table?.id ?? "new"}
			table={table}
			codes={codes}
			onCreated={onCreated}
			onClose={onClose}
		/>
	);

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
								? "Nova Revisão"
								: (table?.identification ?? "Tabela")}
						</SheetTitle>

						{table ? <NormativeTableStatusBadge status={table.status} /> : null}
					</div>

					<SheetDescription>
						{tableId === null
							? "Cadastro de uma revisão de tabela normativa."
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
				) : table ? (
					<Tabs
						key={table.id}
						defaultValue="table"
						className="min-h-0 flex-1 gap-0"
					>
						<TabsList className="w-full justify-start px-6">
							<TabsTrigger value="table" className="flex-none">
								Tabela
							</TabsTrigger>
							<TabsTrigger value="history" className="flex-none">
								Histórico
							</TabsTrigger>
						</TabsList>

						<TabsContent value="table" className="flex min-h-0 flex-col">
							{form}
						</TabsContent>

						<TabsContent
							value="history"
							className="min-h-0 overflow-y-auto px-6 py-6"
						>
							<NormativeTableHistory
								table={table}
								definition={codes.find(({ code }) => code === table.code)}
							/>
						</TabsContent>
					</Tabs>
				) : (
					form
				)}
			</SheetContent>
		</Sheet>
	);
};
