import dayjs from "@lib/dayjs";
import type { NormativeTable } from "@services/normative-tables";

interface MetadataCellProps {
	label: string;
	person?: string | null;
	at?: string | null;
}

const MetadataCell = ({ label, person, at }: MetadataCellProps) => (
	<div className="flex min-w-0 flex-col gap-1.5 px-6 py-4 not-first:border-t sm:not-first:border-t-0 sm:not-first:border-l border-border">
		<dt className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
			{label}
		</dt>
		{person && at ? (
			<dd className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-0.5">
				<span className="truncate text-sm font-medium text-foreground">
					{person}
				</span>
				<time dateTime={at} className="font-mono text-xs text-muted-foreground">
					{dayjs(at).format("DD.MM.YYYY")}
				</time>
			</dd>
		) : (
			<dd className="text-sm text-muted-foreground">Pendente</dd>
		)}
	</div>
);

export const NormativeTableMetadata = ({
	table,
}: {
	table: NormativeTable;
}) => (
	<dl className="grid shrink-0 border-b border-border sm:grid-cols-2">
		<MetadataCell
			label="Cadastro"
			person={table.registeredBy}
			at={table.registeredAt}
		/>
		<MetadataCell
			label="Revisão"
			person={table.verifiedBy}
			at={table.verifiedAt}
		/>
	</dl>
);
