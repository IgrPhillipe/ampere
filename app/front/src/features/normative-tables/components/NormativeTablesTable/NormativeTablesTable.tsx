import { DataTable } from "@components/DataTable";
import { EmptyState } from "@components/EmptyState";
import { SkeletonTable } from "@components/SkeletonTable";
import { Button } from "@components/ui/button";
import { type ListSort, useAuthStore } from "@features/shared";
import { cn } from "@lib/utils";
import type {
	NormativeTable,
	NormativeTableListing,
	NormativeTableSort,
} from "@services/normative-tables";
import { useCallback, useMemo } from "react";

import { useCanManageNormativeTables } from "../../hooks";
import { NormativeTableCards } from "./NormativeTableCards";
import {
	createNormativeTableColumns,
	type NormativeTableColumnId,
} from "./normative-table-columns";
import { getNormativeTableTarget } from "./normative-table-row";

const normativeTableColumnClassNames = {
	attention: "w-5 px-0",
	standard: "w-32",
	item: "hidden xl:table-cell xl:w-32",
	rowCount: "w-18 text-right",
	status: "w-44",
	registeredAt: "hidden xl:table-cell xl:w-48",
	verifiedAt: "hidden lg:table-cell lg:w-48",
	action: "w-28 pr-0 text-right",
} satisfies Partial<Record<NormativeTableColumnId, string>>;

const sortableColumns = [
	"code",
	"registeredAt",
	"verifiedAt",
] as const satisfies readonly NormativeTableSort[];

interface NormativeTablesTableProps {
	tables: NormativeTableListing[];
	isLoading?: boolean;
	/** Receives the revision the line leads to, the pending draft when there is one. */
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
	const canReview = useCanManageNormativeTables();
	const columns = useMemo(
		() => createNormativeTableColumns(onOpen, email, canReview),
		[onOpen, email, canReview],
	);
	const openLine = useCallback(
		(table: NormativeTableListing) => onOpen(getNormativeTableTarget(table)),
		[onOpen],
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
				onOpen={openLine}
				className={cn("md:hidden", className)}
			/>

			<DataTable<
				NormativeTableListing,
				NormativeTableColumnId,
				NormativeTableSort
			>
				columns={columns}
				data={tables}
				columnClassNames={normativeTableColumnClassNames}
				onRowClick={openLine}
				sortableColumns={sortableColumns}
				sort={sort}
				onSortChange={onSortChange}
				className={cn("hidden md:block", className)}
			/>
		</>
	);
};
