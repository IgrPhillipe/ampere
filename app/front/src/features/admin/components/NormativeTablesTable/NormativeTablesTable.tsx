import { DataTable } from "@components/DataTable";
import { EmptyState } from "@components/EmptyState";
import { SkeletonTable } from "@components/SkeletonTable";
import { cn } from "@lib/utils";
import type { NormativeTable } from "@services/normative-tables";
import { useMemo } from "react";

import { NormativeTableCards } from "./NormativeTableCards";
import {
	createNormativeTableColumns,
	type NormativeTableColumnId,
} from "./normative-table-columns";

const normativeTableColumnClassNames = {
	standard: "w-32",
	item: "hidden lg:table-cell lg:w-40",
	rowCount: "w-20",
	status: "w-32",
	registeredBy: "hidden xl:table-cell xl:w-52",
	verifiedBy: "hidden lg:table-cell lg:w-52",
} satisfies Partial<Record<NormativeTableColumnId, string>>;

interface NormativeTablesTableProps {
	tables: NormativeTable[];
	isLoading?: boolean;
	onOpen: (table: NormativeTable) => void;
	className?: string;
}

export const NormativeTablesTable = ({
	tables,
	isLoading = false,
	onOpen,
	className,
}: NormativeTablesTableProps) => {
	const columns = useMemo(() => createNormativeTableColumns(onOpen), [onOpen]);

	if (isLoading) return <SkeletonTable columns={7} />;

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

			<DataTable
				columns={columns}
				data={tables}
				columnClassNames={normativeTableColumnClassNames}
				onRowClick={onOpen}
				className={cn("hidden md:block", className)}
			/>
		</>
	);
};
