import { EmptyState } from "@components/EmptyState";
import { FilterMenu } from "@components/FilterMenu";
import { ListToolbar } from "@components/ListToolbar";
import { PageLayout } from "@components/layout";
import { SearchInput } from "@components/SearchInput";
import { SortMenu, type SortOption } from "@components/SortMenu";
import { Button } from "@components/ui/button";
import {
	type NormativeTable,
	type NormativeTableSort,
	normativeTableStatusSchema,
	useGetNormativeTableList,
} from "@services/normative-tables";
import { CircleAlert, Plus } from "lucide-react";
import { useCallback, useState } from "react";

import {
	NormativeTableActiveFilters,
	NormativeTableSheet,
	NormativeTablesTable,
} from "../../components";
import { normativeTableStatusLabels } from "../../constants";
import {
	NORMATIVE_TABLE_SORT_DIRECTIONS,
	useNormativeTableFilters,
} from "../../hooks";

const sortOptions: SortOption<NormativeTableSort>[] = [
	{ value: "code", label: "Tabela" },
	{ value: "registeredAt", label: "Cadastro" },
	{ value: "verifiedAt", label: "Revisão" },
];

const statusOptions = normativeTableStatusSchema.options.map((value) => ({
	value,
	label: normativeTableStatusLabels[value],
}));

export const NormativeTablesPage = () => {
	const filters = useNormativeTableFilters();
	const tablesQuery = useGetNormativeTableList(filters.params);
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
			title="Tabelas Normativas"
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
				<ListToolbar
					filters={null}
					search={
						<SearchInput
							value={filters.search}
							onValueChange={filters.setSearch}
							placeholder="Buscar por tabela, nome, item ou norma"
							label="Buscar tabelas"
						/>
					}
					sort={
						<SortMenu
							options={sortOptions}
							value={filters.sort}
							directions={NORMATIVE_TABLE_SORT_DIRECTIONS}
							onValueChange={filters.setSort}
						/>
					}
					refinements={
						<FilterMenu
							label="Situação"
							allLabel="Todas"
							options={statusOptions}
							value={filters.status}
							onValueChange={filters.setStatus}
						/>
					}
					activeFilters={<NormativeTableActiveFilters filters={filters} />}
				/>

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
							sort={filters.sort}
							onSortChange={filters.sortBy}
							onClearFilters={
								filters.hasActiveFilters ? filters.clearFilters : undefined
							}
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
