import { EmptyState } from "@components/EmptyState";
import { SectionHeading } from "@components/SectionHeading";
import { Button } from "@components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@components/ui/select";
import { Skeleton } from "@components/ui/skeleton";
import { formatDecimal, padCount } from "@features/shared";
import { cn } from "@lib/utils";
import type {
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

interface ChangeRowProps {
	index: string;
	label: ReactNode;
	from: ReactNode;
	to: ReactNode;
	delta: ReactNode;
	changed: boolean;
}

/** A changed row keeps the sand fill and the orange bar of the prototype. */
const ChangeRow = ({
	index,
	label,
	from,
	to,
	delta,
	changed,
}: ChangeRowProps) => (
	<tr
		data-changed={changed}
		className={cn(
			"border-b border-border align-top",
			changed && "relative bg-surface-hover",
		)}
	>
		<td className="relative py-3.5 pl-3 font-mono text-xs text-faint-foreground">
			{changed ? (
				<span
					aria-hidden="true"
					className="absolute inset-y-2 left-0 w-0.5 bg-attention"
				/>
			) : null}
			{index}
		</td>
		<td className="py-3.5 pr-3 text-sm break-words text-foreground">{label}</td>
		<td
			className={cn(
				"py-3.5 pr-3 text-right font-mono text-sm break-words",
				changed ? "text-muted-foreground" : "text-foreground",
			)}
		>
			{from}
		</td>
		<td className="py-3.5 pr-3 text-right font-mono text-sm break-words text-foreground">
			{to}
		</td>
		<td className="py-3.5 text-right font-mono text-sm break-words text-foreground">
			{delta}
		</td>
	</tr>
);

const HeadRow = ({
	first,
	from,
	to,
}: {
	first: string;
	from: string;
	to: string;
}) => (
	<thead>
		<tr className="border-b border-border font-mono text-2xs tracking-[0.11em] text-faint-foreground uppercase">
			<th scope="col" className="w-10 py-3 pl-3 text-left font-normal">
				<span className="sr-only">Linha</span>
			</th>
			<th scope="col" className="py-3 pr-4 text-left font-normal">
				{first}
			</th>
			<th scope="col" className="w-24 py-3 pr-3 text-right font-normal">
				{from}
			</th>
			<th scope="col" className="w-24 py-3 pr-3 text-right font-normal">
				{to}
			</th>
			<th scope="col" className="w-20 py-3 text-right font-normal">
				Δ
			</th>
		</tr>
	</thead>
);

const groupDetail = ({ fields }: GroupChange) =>
	fields.length === 0 ? null : (
		<ul className="mt-1 flex flex-col gap-0.5 text-xs text-muted-foreground">
			{fields.map((field) => (
				<li key={field.field}>
					{field.label}: {fieldValue(field, "from")} → {fieldValue(field, "to")}
				</li>
			))}
		</ul>
	);

interface VersionPickerProps {
	label: string;
	value: number;
	versions: ProjectVersion[];
	disabledVersion: number;
	onValueChange: (value: number) => void;
}

const VersionPicker = ({
	label,
	value,
	versions,
	disabledVersion,
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
				{versions.map(({ number }) => (
					<SelectItem
						key={number}
						value={String(number)}
						disabled={number === disabledVersion}
					>
						{formatVersion(number)}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
};

/** H14: what changed between two submissions, line by line. */
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

	const memoryRows = comparison
		? [
				{
					key: "demand",
					label: "Demanda total da edificação",
					from: `${formatDecimal(comparison.from.demandKva, 1)} kVA`,
					to: `${formatDecimal(comparison.to.demandKva, 1)} kVA`,
					delta: formatKvaDelta(comparison.demandDifferenceKva),
					changed: comparison.demandDifferenceKva !== 0,
				},
				...comparison.building.map((field) => ({
					key: field.field,
					label: field.label,
					from: fieldValue(field, "from"),
					to: fieldValue(field, "to"),
					delta: "—",
					changed: true,
				})),
			]
		: [];
	const changedMemory = memoryRows.filter(({ changed }) => changed).length;

	const groupRows = comparison
		? [
				...comparison.changed.map((group) => ({
					group,
					from: "—",
					to: "—",
					status: "Alterado",
				})),
				...comparison.included.map((group) => ({
					group,
					from: "—",
					to: "incluído",
					status: "Incluído",
				})),
				...comparison.removed.map((group) => ({
					group,
					from: "presente",
					to: "removido",
					status: "Removido",
				})),
			]
		: [];

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
					<span>Comparando</span>
					<VersionPicker
						label="Versão de origem"
						value={compared.from}
						versions={sorted}
						disabledVersion={compared.to}
						onValueChange={(from) => onComparedChange({ ...compared, from })}
					/>
					<span aria-hidden="true">→</span>
					<VersionPicker
						label="Versão de destino"
						value={compared.to}
						versions={sorted}
						disabledVersion={compared.from}
						onValueChange={(to) => onComparedChange({ ...compared, to })}
					/>
					{comparison ? (
						<span className="font-mono text-foreground">
							{formatDecimal(comparison.from.demandKva, 1)} →{" "}
							{formatDecimal(comparison.to.demandKva, 1)} kVA
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
					<Skeleton className="h-12 w-full" />
					<Skeleton className="h-12 w-full" />
					<Skeleton className="h-12 w-full" />
				</div>
			) : (
				<>
					<div className="flex flex-col gap-3">
						<SectionHeading
							as="h3"
							meta={`${padCount(memoryRows.length)} linhas · ${padCount(changedMemory)} alteradas`}
						>
							Memória de Cálculo
						</SectionHeading>
						<div>
							<table className="w-full table-fixed">
								<HeadRow first="Linha" from={fromLabel} to={toLabel} />
								<tbody>
									{memoryRows.map((row, index) => (
										<ChangeRow
											key={row.key}
											index={padCount(index + 1)}
											label={row.label}
											from={row.from}
											to={row.to}
											delta={row.delta}
											changed={row.changed}
										/>
									))}
								</tbody>
							</table>
						</div>
					</div>

					<div className="flex flex-col gap-3">
						<SectionHeading
							as="h3"
							meta={`${padCount(comparison.changed.length)} alterados · ${padCount(comparison.included.length)} incluídos · ${padCount(comparison.removed.length)} removidos`}
						>
							Grupos de UCs
						</SectionHeading>
						{groupRows.length === 0 ? (
							<p className="text-sm text-muted-foreground">
								Nenhum grupo de UCs mudou entre a {fromLabel} e a {toLabel}.
							</p>
						) : (
							<div>
								<table className="w-full table-fixed">
									<HeadRow first="Grupo" from={fromLabel} to={toLabel} />
									<tbody>
										{groupRows.map(({ group, from, to, status }, index) => (
											<ChangeRow
												key={`${status}-${group.id}`}
												index={`G${index + 1}`}
												label={
													<>
														{group.name}
														{groupDetail(group)}
													</>
												}
												from={from}
												to={to}
												delta={
													<span className="text-2xs tracking-[0.11em] uppercase">
														{status}
													</span>
												}
												changed
											/>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>

					<p className="text-xs text-muted-foreground">
						Linhas sem marca não mudaram entre as versões e não precisam ser
						conferidas de novo.
					</p>
				</>
			)}
		</section>
	);
};
