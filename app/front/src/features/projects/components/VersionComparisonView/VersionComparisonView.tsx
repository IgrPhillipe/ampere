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
import { formatDate, formatKva, padCount } from "@features/shared";
import { cn } from "@lib/utils";
import type {
	FieldChange,
	GroupChange,
	ProjectVersion,
	VersionComparison,
} from "@services/project-versions";
import { ArrowLeft, CircleAlert } from "lucide-react";
import type { ReactNode } from "react";

import { fieldValue, formatKvaDelta, formatVersion } from "../../constants";

export interface ComparedVersions {
	from: number;
	to: number;
}

interface VersionComparisonViewProps {
	versions: ProjectVersion[];
	compared: ComparedVersions;
	onComparedChange: (compared: ComparedVersions) => void;
	onClose: () => void;
	comparison?: VersionComparison;
	isLoading?: boolean;
	isError?: boolean;
	onRetry?: () => void;
	className?: string;
}

type GroupStatus = "changed" | "included" | "removed";

const groupStatusLabels: Record<GroupStatus, string> = {
	changed: "Alterado",
	included: "Incluído",
	removed: "Removido",
};

const pluralize = (count: number, one: string, many: string) =>
	`${padCount(count)} ${count === 1 ? one : many}`;

/** "Ar-condicionado, potência de placa" reads as the item and then its field. */
const FieldLabel = ({ label }: { label: string }) => {
	const [item, ...rest] = label.split(", ");
	if (rest.length === 0) return <span>{label}</span>;

	const field = rest.join(", ");
	return (
		<span className="flex flex-col">
			<span className="text-xs text-muted-foreground">{item}</span>
			<span>{field.charAt(0).toUpperCase() + field.slice(1)}</span>
		</span>
	);
};

/** Fixed columns leave the label too narrow on a phone, so the table scrolls sideways there. */
const FieldTable = ({
	label,
	fields,
	fromLabel,
	toLabel,
}: {
	label: string;
	fields: readonly FieldChange[];
	fromLabel: string;
	toLabel: string;
}) => (
	<div
		role="region"
		aria-label={label}
		tabIndex={0}
		className="overflow-x-auto"
	>
		<table className="w-full min-w-[28rem] table-fixed text-sm">
			<thead>
				<tr className="border-b border-border font-mono text-2xs tracking-[0.11em] text-faint-foreground uppercase">
					<th scope="col" className="py-2.5 pr-4 pl-4 text-left font-normal">
						Campo
					</th>
					<th scope="col" className="w-36 py-2.5 pr-4 text-left font-normal">
						Antes ({fromLabel})
					</th>
					<th scope="col" className="w-36 py-2.5 pr-4 text-left font-normal">
						Depois ({toLabel})
					</th>
				</tr>
			</thead>
			<tbody>
				{fields.map((field) => (
					<tr
						key={field.field}
						className="border-b border-border align-top last:border-b-0"
					>
						<th
							scope="row"
							className="py-3 pr-4 pl-4 text-left font-normal break-words text-foreground"
						>
							<FieldLabel label={field.label} />
						</th>
						<td className="py-3 pr-4 break-words text-muted-foreground">
							{fieldValue(field, "from")}
						</td>
						<td className="py-3 pr-4 font-medium break-words text-foreground">
							{fieldValue(field, "to")}
						</td>
					</tr>
				))}
			</tbody>
		</table>
	</div>
);

const groupNote = (status: GroupStatus, from: string, to: string) =>
	status === "included"
		? `Grupo novo na ${to}.`
		: status === "removed"
			? `Grupo que estava na ${from} e saiu na ${to}.`
			: "Nenhum campo do grupo mudou.";

const GroupCard = ({
	group,
	status,
	fromLabel,
	toLabel,
}: {
	group: GroupChange;
	status: GroupStatus;
	fromLabel: string;
	toLabel: string;
}) => (
	<li className="relative border border-border">
		<span
			aria-hidden="true"
			className="absolute inset-y-0 left-0 w-0.5 bg-attention"
		/>
		<div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
			<h4 className="min-w-0 text-sm font-medium break-words text-foreground">
				{group.name}
			</h4>
			<Badge variant="tag">{groupStatusLabels[status]}</Badge>
		</div>
		{status === "changed" && group.fields.length > 0 ? (
			<FieldTable
				label={`Campos de ${group.name}`}
				fields={group.fields}
				fromLabel={fromLabel}
				toLabel={toLabel}
			/>
		) : (
			<p className="px-4 py-3 text-sm text-muted-foreground">
				{groupNote(status, fromLabel, toLabel)}
			</p>
		)}
	</li>
);

const SummaryCell = ({
	label,
	children,
}: {
	label: string;
	children: ReactNode;
}) => (
	<div className="flex min-w-0 flex-col gap-1.5 border-l border-border pl-4 first:border-l-0 first:pl-0">
		<dt className="font-mono text-2xs tracking-[0.11em] text-faint-foreground uppercase">
			{label}
		</dt>
		<dd className="text-sm text-foreground">{children}</dd>
	</div>
);

interface VersionPickerProps {
	label: string;
	value: number;
	versions: ProjectVersion[];
	/** The API compares an older version to a newer one, so the other side bounds this one. */
	isAllowed: (number: number) => boolean;
	onValueChange: (value: number) => void;
}

const VersionPicker = ({
	label,
	value,
	versions,
	isAllowed,
	onValueChange,
}: VersionPickerProps) => {
	const items = Object.fromEntries(
		versions.map(({ number }) => [String(number), formatVersion(number)]),
	);

	return (
		<Select
			items={items}
			value={String(value)}
			onValueChange={(next) => {
				if (typeof next === "string") onValueChange(Number(next));
			}}
		>
			<SelectTrigger
				variant="default"
				aria-label={label}
				className="h-9 w-24 px-3 font-mono"
			>
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{versions.map(({ number, submittedAt }) => (
					<SelectItem
						key={number}
						value={String(number)}
						disabled={!isAllowed(number)}
					>
						{formatVersion(number)}
						<span className="sr-only">, de {formatDate(submittedAt)}</span>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
};

/** H14: what changed between two submissions, field by field. */
export const VersionComparisonView = ({
	versions,
	compared,
	onComparedChange,
	onClose,
	comparison,
	isLoading = false,
	isError = false,
	onRetry,
	className,
}: VersionComparisonViewProps) => {
	const sorted = [...versions].sort((a, b) => a.number - b.number);
	const fromLabel = formatVersion(compared.from);
	const toLabel = formatVersion(compared.to);

	const groups = comparison
		? [
				...comparison.changed.map((group) => ({
					group,
					status: "changed" as const,
				})),
				...comparison.included.map((group) => ({
					group,
					status: "included" as const,
				})),
				...comparison.removed.map((group) => ({
					group,
					status: "removed" as const,
				})),
			]
		: [];
	const unchanged =
		comparison !== undefined &&
		comparison.demandDifferenceKva === 0 &&
		comparison.building.length === 0 &&
		groups.length === 0;

	return (
		<section
			aria-labelledby="comparativo-titulo"
			className={cn("flex flex-col gap-8", className)}
		>
			<div className="flex flex-col gap-4">
				<SectionHeading
					id="comparativo-titulo"
					actions={
						<Button type="button" variant="ghost" size="sm" onClick={onClose}>
							<ArrowLeft aria-hidden="true" />
							Linha do Tempo
						</Button>
					}
				>
					Comparativo de Versões
				</SectionHeading>

				<div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
					<span>De</span>
					<VersionPicker
						label="Versão de origem"
						value={compared.from}
						versions={sorted}
						isAllowed={(number) => number < compared.to}
						onValueChange={(from) => onComparedChange({ ...compared, from })}
					/>
					<span>para</span>
					<VersionPicker
						label="Versão de destino"
						value={compared.to}
						versions={sorted}
						isAllowed={(number) => number > compared.from}
						onValueChange={(to) => onComparedChange({ ...compared, to })}
					/>
					{comparison ? (
						<span>
							enviadas em {formatDate(comparison.from.submittedAt)} e{" "}
							{formatDate(comparison.to.submittedAt)}
						</span>
					) : null}
				</div>
			</div>

			{isError ? (
				<EmptyState
					title="Não foi possível comparar as versões"
					description="Confira o aviso exibido e tente novamente."
					icon={CircleAlert}
					action={
						onRetry ? (
							<Button type="button" variant="outline" onClick={onRetry}>
								Tentar Novamente
							</Button>
						) : undefined
					}
				/>
			) : isLoading || !comparison ? (
				<div className="flex flex-col gap-3" aria-busy="true">
					<Skeleton className="h-16 w-full" />
					<Skeleton className="h-32 w-full" />
				</div>
			) : (
				<>
					<dl
						aria-label="Resumo do comparativo"
						className="grid grid-cols-1 gap-4 border-y border-border py-4 sm:grid-cols-3"
					>
						<SummaryCell label="Demanda total">
							<span className="font-mono">
								{formatKva(comparison.from.demandKva, 1)} →{" "}
								{formatKva(comparison.to.demandKva, 1)}
							</span>
							<span className="block text-xs text-muted-foreground">
								{comparison.demandDifferenceKva === 0
									? "Sem mudança"
									: `${formatKvaDelta(comparison.demandDifferenceKva)} kVA`}
							</span>
						</SummaryCell>
						<SummaryCell label="Grupos de UCs">
							{groups.length === 0
								? "Nenhum mudou"
								: [
										comparison.changed.length > 0 &&
											pluralize(
												comparison.changed.length,
												"alterado",
												"alterados",
											),
										comparison.included.length > 0 &&
											pluralize(
												comparison.included.length,
												"incluído",
												"incluídos",
											),
										comparison.removed.length > 0 &&
											pluralize(
												comparison.removed.length,
												"removido",
												"removidos",
											),
									]
										.filter(Boolean)
										.join(", ")}
						</SummaryCell>
						<SummaryCell label="Dados da edificação">
							{comparison.building.length === 0
								? "Nenhum mudou"
								: pluralize(
										comparison.building.length,
										"campo alterado",
										"campos alterados",
									)}
						</SummaryCell>
					</dl>

					{unchanged ? (
						<p className="text-sm text-muted-foreground">
							Nada mudou entre a {fromLabel} e a {toLabel}.
						</p>
					) : null}

					{comparison.building.length > 0 ? (
						<div className="flex flex-col gap-3">
							<SectionHeading as="h3">Dados da Edificação</SectionHeading>
							<div className="relative border border-border">
								<span
									aria-hidden="true"
									className="absolute inset-y-0 left-0 w-0.5 bg-attention"
								/>
								<FieldTable
									label="Dados da edificação"
									fields={comparison.building}
									fromLabel={fromLabel}
									toLabel={toLabel}
								/>
							</div>
						</div>
					) : null}

					{groups.length > 0 ? (
						<div className="flex flex-col gap-3">
							<SectionHeading as="h3">Grupos de UCs</SectionHeading>
							<ul
								aria-label="Grupos que mudaram"
								className="flex flex-col gap-3"
							>
								{groups.map(({ group, status }) => (
									<GroupCard
										key={`${status}-${group.id}`}
										group={group}
										status={status}
										fromLabel={fromLabel}
										toLabel={toLabel}
									/>
								))}
							</ul>
						</div>
					) : null}
				</>
			)}
		</section>
	);
};
