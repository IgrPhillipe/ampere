import type { NormativeTableListing } from "@services/normative-tables";

import { formatCount } from "../../constants";

export const TableIdentity = ({ table }: { table: NormativeTableListing }) => (
	<div className="flex min-w-0 flex-col gap-1 whitespace-normal">
		<span className="text-base font-medium text-foreground">
			{table.identification}
		</span>
		<span className="text-sm text-muted-foreground">{table.title}</span>
		{table.revisionCount > 1 ? (
			<span className="font-mono text-xs text-faint-foreground">
				{formatCount(table.revisionCount, "revisão", "revisões")}
			</span>
		) : null}
	</div>
);
