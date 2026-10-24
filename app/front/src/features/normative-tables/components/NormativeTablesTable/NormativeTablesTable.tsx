import { DataTable } from "@components/DataTable";
import { EmptyState } from "@components/EmptyState";
import { SkeletonTable } from "@components/SkeletonTable";
import { Button } from "@components/ui/button";
import { type ListSort, useAuthStore } from "@features/shared";
import { cn } from "@lib/utils";
import type {
	NormativeTable,
	NormativeTableSort,
} from "@services/normative-tables";
import { useMemo } from "react";

import { NormativeTableCards } from "./NormativeTableCards";
import {
	createNormativeTableColumns,
	type NormativeTableColumnId,
} from "./normative-table-columns";

const normativeTableColumnClassNames = {
	standard: "w-32",
	item: "hidden xl:table-cell xl:w-36",
	rowCount: "w-20 text-center",
	status: "w-52 text-center",
	registeredAt: "hidden xl:table-cell xl:w-44",
	verifiedAt: "hidden lg:table-cell lg:w-44",
	action: "w-32",
} satisfies Partial<Record<NormativeTableColumnId, string>>;

const sortableColumns = [
	"code",
	"registeredAt",
	"verifiedAt",
] as const satisfies readonly NormativeTableSort[];

interface NormativeTablesTableProps {
	tables: NormativeTable[];
	isLoading?: boolean;
	onOpen: (table: NormativeTable) => void;
	sort?: ListSort<NormativeTableSort>;
	onSortChange?: (column: NormativeTableSort) => void;
	/** Present while a search or filter narrows the list. */
	onClearFilters?: () => void;
	className?: string;
}

export const NormativeTablesTable = ({
	tables,
	isLoading = false,
	onOpen,
	sort,
	onSortChange,
	onClearFilters,
	className,
}: NormativeTablesTableProps) => {
	const email = useAuthStore((state) => state.user?.email);
	const columns = useMemo(
		() => createNormativeTableColumns(onOpen, email),
		[onOpen, email],
	);

	if (isLoading) return <SkeletonTable columns={8} />;

	if (tables.length === 0 && onClearFilters) {
		return (
			<EmptyState
				title="Nenhuma tabela encontrada para os critérios informados"
				description="Revise a busca e os filtros, ou limpe os filtros para ver todas as tabelas."
				action={
					<Button type="button" variant="outline" onClick={onClearFilters}>
						Limpar Filtros
					</Button>
				}
			/>
		);
	}

	if (tables.length === 0) {
		return (
			<EmptyState
				title="Nenhuma tabela cadastrada"
				description="Cadastre as tabelas das normas para o cálculo de demanda usá-las."
			/>
		);
	}

	return (
		<>
			<NormativeTableCards
				tables={tables}
				onOpen={onOpen}
				className={cn("md:hidden", className)}
			/>

			<DataTable<NormativeTable, NormativeTableColumnId, NormativeTableSort>
				columns={columns}
				data={tables}
				columnClassNames={normativeTableColumnClassNames}
				onRowClick={onOpen}
				sortableColumns={sortableColumns}
				sort={sort}
				onSortChange={onSortChange}
				className={cn("hidden md:block", className)}
			/>
		</>
	);
};
