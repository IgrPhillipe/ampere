import { EmptyState } from "@components/EmptyState";
import { SectionHeading } from "@components/SectionHeading";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@components/ui/select";
import { Skeleton } from "@components/ui/skeleton";
import { padCount } from "@features/shared";
import { cn } from "@lib/utils";
import {
	type NormativeTable,
	type NormativeTableCode,
	type NormativeTableRow,
	useCompareNormativeTableRevisions,
} from "@services/normative-tables";
import { CircleAlert } from "lucide-react";

import {
	byRegistration,
	formatRevision,
	formatRowEntry,
	type RowValue,
	rowValues,
} from "../../constants";

export interface ComparedRevisions {
	from: string;
	to: string;
}

interface NormativeTableRevisionComparisonProps {
	tableId: string;
	revisions: NormativeTable[];
	compared: ComparedRevisions;
	definition?: NormativeTableCode;
	onComparedChange: (compared: ComparedRevisions) => void;
}

interface RevisionPickerProps {
	label: string;
	value: string;
	revisions: NormativeTable[];
	/** The API compares an older revision to a newer one, so the other side bounds this one. */
	isAllowed: (revision: NormativeTable) => boolean;
	onValueChange: (value: string) => void;
}

const RevisionPicker = ({
	label,
	value,
	revisions,
	isAllowed,
	onValueChange,
}: RevisionPickerProps) => (
	<Select
		items={Object.fromEntries(
			revisions.map((revision) => [revision.id, formatRevision(revision)]),
		)}
		value={value}
		onValueChange={(next) => {
			if (typeof next === "string") onValueChange(next);
		}}
	>
		<SelectTrigger
			variant="default"
			aria-label={label}
			className="h-9 w-fit px-3"
		>
			<SelectValue />
		</SelectTrigger>
		<SelectContent>
			{revisions.map((revision) => (
				<SelectItem
					key={revision.id}
					value={revision.id}
					disabled={!isAllowed(revision)}
				>
					{formatRevision(revision)}
				</SelectItem>
			))}
		</SelectContent>
	</Select>
);

/** On a changed row, the values that stayed the same recede. */
const Values = ({
	values,
	other,
}: {
	values: RowValue[];
	other?: RowValue[];
}) => {
	const kept = (entry: RowValue) =>
		other?.some(
			({ label, value }) => label === entry.label && value === entry.value,
		) ?? false;

	return values.length === 1 ? (
		<span>{values[0].value}</span>
	) : (
		<ul className="flex flex-col gap-1">
			{values.map((entry) => (
				<li
					key={entry.label}
					className={cn(kept(entry) && "text-faint-foreground")}
				>
					<span className="block font-sans text-xs text-muted-foreground">
						{entry.label}
					</span>
					{entry.value}
				</li>
			))}
		</ul>
	);
};

const Absent = () => <span className="text-faint-foreground">Não consta</span>;

interface ChangeLine {
	key: string;
	entry: string;
	before?: NormativeTableRow;
	after?: NormativeTableRow;
	status: "Alterada" | "Incluída" | "Removida";
}

const statusVariants = {
	Alterada: "warning",
	Incluída: "success",
	Removida: "neutral",
} as const satisfies Record<ChangeLine["status"], string>;

/** Rows added, removed and changed between two revisions of the same table. */
export const NormativeTableRevisionComparison = ({
	tableId,
	revisions,
	compared,
	definition,
	onComparedChange,
}: NormativeTableRevisionComparisonProps) => {
	const comparisonQuery = useCompareNormativeTableRevisions({
		id: tableId,
		...compared,
	});
	const comparison = comparisonQuery.data?.data;
	const sorted = [...revisions].sort(byRegistration);
	const find = (id: string) => sorted.find((revision) => revision.id === id);
	const from = find(compared.from);
	const to = find(compared.to);

	const lines: ChangeLine[] = comparison
		? [
				...comparison.changed.map(({ before, after }, index) => ({
					key: `changed-${index}`,
					entry: formatRowEntry(after, definition),
					before,
					after,
					status: "Alterada" as const,
				})),
				...comparison.included.map((row, index) => ({
					key: `included-${index}`,
					entry: formatRowEntry(row, definition),
					after: row,
					status: "Incluída" as const,
				})),
				...comparison.removed.map((row, index) => ({
					key: `removed-${index}`,
					entry: formatRowEntry(row, definition),
					before: row,
					status: "Removida" as const,
				})),
			]
		: [];

	return (
		<section
			aria-labelledby="comparativo-revisoes-titulo"
			className="flex flex-col gap-4"
		>
			<SectionHeading
				as="h3"
				id="comparativo-revisoes-titulo"
				meta={
					comparison
						? `${padCount(comparison.changed.length)} alteradas, ${padCount(comparison.included.length)} incluídas, ${padCount(comparison.removed.length)} removidas`
						: undefined
				}
			>
				Comparativo
			</SectionHeading>

			<div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
				<span>Da</span>
				<RevisionPicker
					label="Revisão de origem"
					value={compared.from}
					revisions={sorted}
					isAllowed={(revision) =>
						to !== undefined && byRegistration(revision, to) < 0
					}
					onValueChange={(next) =>
						onComparedChange({ ...compared, from: next })
					}
				/>
				<span>para a</span>
				<RevisionPicker
					label="Revisão de destino"
					value={compared.to}
					revisions={sorted}
					isAllowed={(revision) =>
						from !== undefined && byRegistration(revision, from) > 0
					}
					onValueChange={(next) => onComparedChange({ ...compared, to: next })}
				/>
			</div>

			{comparisonQuery.isError ? (
				<EmptyState
					title="Não foi possível comparar as revisões"
					description="Confira o aviso exibido e tente novamente."
					icon={CircleAlert}
					action={
						<Button
							type="button"
							variant="outline"
							onClick={() => void comparisonQuery.refetch()}
						>
							Tentar Novamente
						</Button>
					}
				/>
			) : !comparison ? (
				<div className="flex flex-col gap-3" aria-busy="true">
					<Skeleton className="h-12 w-full" />
					<Skeleton className="h-12 w-full" />
				</div>
			) : lines.length === 0 ? (
				<p className="text-sm text-muted-foreground">
					Nenhuma linha mudou entre as duas revisões.
				</p>
			) : (
				<div
					role="region"
					aria-label="Linhas que mudaram"
					tabIndex={0}
					className="overflow-x-auto"
				>
					<table className="w-full min-w-[32rem] table-fixed">
						<thead>
							<tr className="border-b border-border font-mono text-2xs tracking-[0.11em] text-faint-foreground uppercase">
								<th scope="col" className="py-3 pr-4 text-left font-normal">
									Linha
								</th>
								<th
									scope="col"
									className="w-40 py-3 pr-3 text-right font-normal"
								>
									Origem
								</th>
								<th
									scope="col"
									className="w-40 py-3 pr-3 text-right font-normal"
								>
									Destino
								</th>
								<th scope="col" className="w-24 py-3 text-right font-normal">
									<span className="sr-only">Situação</span>
								</th>
							</tr>
						</thead>
						<tbody>
							{lines.map(({ key, entry, before, after, status }) => (
								<tr key={key} className="border-b border-border align-top">
									<td className="py-3.5 pr-4 text-sm break-words text-foreground">
										{entry}
									</td>
									<td className="py-3.5 pr-3 text-right font-mono text-sm break-words text-muted-foreground">
										{before ? (
											<Values
												values={rowValues(before, definition)}
												other={after && rowValues(after, definition)}
											/>
										) : (
											<Absent />
										)}
									</td>
									<td className="py-3.5 pr-3 text-right font-mono text-sm break-words text-foreground">
										{after ? (
											<Values
												values={rowValues(after, definition)}
												other={before && rowValues(before, definition)}
											/>
										) : (
											<Absent />
										)}
									</td>
									<td className="py-3.5 text-right">
										<Badge variant={statusVariants[status]}>{status}</Badge>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</section>
	);
};
