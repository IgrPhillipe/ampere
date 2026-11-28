import { EmptyState } from "@components/EmptyState";
import { SectionHeading } from "@components/SectionHeading";
import { Button } from "@components/ui/button";
import { Skeleton } from "@components/ui/skeleton";
import { formatDate } from "@features/shared";
import { cn } from "@lib/utils";
import {
	type NormativeTable,
	type NormativeTableCode,
	useGetNormativeTableRevisions,
} from "@services/normative-tables";
import { CircleAlert } from "lucide-react";
import { useState } from "react";

import { formatCount, formatRevision } from "../../constants";
import { NormativeTableStatusBadge } from "../NormativeTableStatusBadge";
import {
	type ComparedRevisions,
	NormativeTableRevisionComparison,
} from "./NormativeTableRevisionComparison";

interface NormativeTableHistoryProps {
	table: NormativeTable;
	definition?: NormativeTableCode;
	/** Loads another revision of the same table in place of the open one. */
	onOpenRevision?: (id: string) => void;
}

/** From the approval to the approval of the revision that replaced it. */
const formatValidity = ({ verifiedAt, supersededAt }: NormativeTable) => {
	if (!verifiedAt) return null;

	return supersededAt
		? `${formatDate(verifiedAt)} a ${formatDate(supersededAt)}`
		: `desde ${formatDate(verifiedAt)}`;
};

/** The open revision against the one before it, or the one after when it is the first. */
const defaultComparison = (
	revisions: NormativeTable[],
	openId: string,
): ComparedRevisions | null => {
	// Newest first, as the API orders them.
	const index = revisions.findIndex(({ id }) => id === openId);

	if (revisions.length < 2 || index < 0) return null;

	return index < revisions.length - 1
		? { from: revisions[index + 1].id, to: openId }
		: { from: openId, to: revisions[index - 1].id };
};

const PersonLine = ({
	label,
	person,
	at,
}: {
	label: string;
	person?: string | null;
	at?: string | null;
}) => (
	<div className="flex min-w-0 gap-1.5">
		<dt className="text-muted-foreground">{label}</dt>
		<dd className="min-w-0 truncate text-foreground">
			{person && at ? (
				<>
					{person}{" "}
					<time dateTime={at} className="font-mono text-muted-foreground">
						em {formatDate(at)}
					</time>
				</>
			) : (
				<span className="text-muted-foreground">Pendente</span>
			)}
		</dd>
	</div>
);

export const NormativeTableHistory = ({
	table,
	definition,
	onOpenRevision,
}: NormativeTableHistoryProps) => {
	const revisionsQuery = useGetNormativeTableRevisions(table.id);
	const revisions = revisionsQuery.data?.data ?? [];
	const [chosen, setChosen] = useState<ComparedRevisions | null>(null);
	const compared = chosen ?? defaultComparison(revisions, table.id);

	if (revisionsQuery.isError) {
		return (
			<EmptyState
				title="Não foi possível carregar o histórico"
				description="Verifique sua conexão e tente novamente."
				icon={CircleAlert}
				action={
					<Button
						type="button"
						variant="outline"
						onClick={() => void revisionsQuery.refetch()}
					>
						Tentar Novamente
					</Button>
				}
			/>
		);
	}

	if (revisionsQuery.isPending) {
		return (
			<div className="flex flex-col gap-3" aria-busy="true">
				<Skeleton className="h-20 w-full rounded-sm" />
				<Skeleton className="h-20 w-full rounded-sm" />
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-8">
			<section
				aria-labelledby="historico-titulo"
				className="flex flex-col gap-3"
			>
				<SectionHeading
					as="h3"
					id="historico-titulo"
					meta={formatCount(revisions.length, "revisão", "revisões")}
				>
					Revisões
				</SectionHeading>

				<ol className="flex flex-col">
					{revisions.map((revision, index) => {
						const isOpen = revision.id === table.id;
						const label = formatRevision(revisions.length - index);
						const validity = formatValidity(revision);

						return (
							<li
								key={revision.id}
								aria-current={isOpen ? "true" : undefined}
								className={cn(
									"flex flex-col gap-2 border-b border-border py-4",
									isOpen && "bg-surface-hover px-3",
								)}
							>
								<div className="flex flex-wrap items-center gap-3">
									<span className="text-sm font-medium text-foreground">
										{label}
									</span>
									<NormativeTableStatusBadge status={revision.status} />
									{isOpen ? (
										<span className="font-mono text-2xs tracking-[0.11em] text-faint-foreground uppercase">
											Aberta
										</span>
									) : onOpenRevision ? (
										<Button
											type="button"
											variant="outline"
											size="sm"
											className="ml-auto"
											aria-label={`Abrir ${label}`}
											onClick={() => onOpenRevision(revision.id)}
										>
											Abrir
										</Button>
									) : null}
								</div>

								<dl className="flex flex-col gap-1 text-xs sm:flex-row sm:flex-wrap sm:gap-x-6">
									<div className="flex gap-1.5">
										<dt className="text-muted-foreground">Norma</dt>
										<dd className="font-mono text-foreground">
											{revision.standard.name} {revision.standard.revision}
										</dd>
									</div>
									<div className="flex gap-1.5">
										<dt className="text-muted-foreground">Linhas</dt>
										<dd className="font-mono text-foreground">
											{revision.rowCount}
										</dd>
									</div>
									<PersonLine
										label="Cadastro"
										person={revision.registeredByName}
										at={revision.registeredAt}
									/>
									<PersonLine
										label="Aprovação"
										person={revision.verifiedByName}
										at={revision.verifiedAt}
									/>
									{validity ? (
										<div className="flex gap-1.5">
											<dt className="text-muted-foreground">Vigência</dt>
											<dd className="font-mono text-foreground">{validity}</dd>
										</div>
									) : null}
								</dl>
							</li>
						);
					})}
				</ol>
			</section>

			{compared ? (
				<NormativeTableRevisionComparison
					tableId={table.id}
					revisions={revisions}
					compared={compared}
					definition={definition}
					onComparedChange={setChosen}
				/>
			) : (
				<p className="text-sm text-muted-foreground">
					Esta é a única revisão desta tabela. O comparativo aparece quando
					outra revisão for cadastrada.
				</p>
			)}
		</div>
	);
};
