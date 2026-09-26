import { EmptyState } from "@components/EmptyState";
import { PageLayout } from "@components/layout";
import { Button } from "@components/ui/button";
import {
	type NormativeTable,
	useGetNormativeTableList,
} from "@services/normative-tables";
import { CircleAlert, Plus } from "lucide-react";
import { useCallback, useState } from "react";

import { NormativeTableSheet, NormativeTablesTable } from "../../components";

export const NormativeTablesPage = () => {
	const tablesQuery = useGetNormativeTableList();
	const [isSheetOpen, setSheetOpen] = useState(false);
	// Kept after closing so the sheet does not swap content mid-animation.
	const [tableId, setTableId] = useState<string | null>(null);

	const openTable = useCallback((table: NormativeTable) => {
		setTableId(table.id);
		setSheetOpen(true);
	}, []);

	const openNewTable = () => {
		setTableId(null);
		setSheetOpen(true);
	};

	return (
		<PageLayout
			title="Normas e Tabelas"
			description="Parâmetros das normas aplicados pelo cálculo de demanda, versionados por revisão."
			bleed
			actions={
				<Button type="button" size="sm" onClick={openNewTable}>
					<Plus aria-hidden="true" />
					Nova Tabela
				</Button>
			}
			className="mx-auto min-h-full w-full max-w-page pb-0 md:pb-0"
		>
			<section
				className="flex flex-1 flex-col bg-card"
				aria-label="Tabelas das normas"
			>
				<div className="flex-1 px-gutter py-4 md:px-gutter-md md:py-5">
					{tablesQuery.isError ? (
						<EmptyState
							title="Não foi possível carregar as tabelas"
							description="Verifique sua conexão e tente novamente."
							icon={CircleAlert}
							action={
								<Button
									type="button"
									variant="outline"
									onClick={() => void tablesQuery.refetch()}
								>
									Tentar Novamente
								</Button>
							}
						/>
					) : (
						<NormativeTablesTable
							tables={tablesQuery.data?.data ?? []}
							isLoading={tablesQuery.isPending}
							onOpen={openTable}
						/>
					)}
				</div>
			</section>

			<NormativeTableSheet
				open={isSheetOpen}
				tableId={tableId}
				onCreated={openTable}
				onClose={() => setSheetOpen(false)}
			/>
		</PageLayout>
	);
};
