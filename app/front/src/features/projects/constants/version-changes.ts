import { formatDecimal, formatKva, padCount } from "@features/shared";
import type {
	FieldChange,
	ProjectVersion,
	VersionComparison,
} from "@services/project-versions";

export const formatVersion = (number: number) => `v${padCount(number)}`;

/** "+2,4" or "−1,0"; zero reads as no change. */
export const formatKvaDelta = (delta: number) => {
	if (delta === 0) return "—";

	return `${delta > 0 ? "+" : "−"}${formatDecimal(Math.abs(delta), 1)}`;
};

/** The value as people read it, falling back to the raw one. */
export const fieldValue = (
	change: FieldChange,
	side: "from" | "to",
): string => {
	const label = side === "from" ? change.fromLabel : change.toLabel;
	const raw = side === "from" ? change.from : change.to;

	return label ?? raw ?? "—";
};

export interface VersionChangeItem {
	title: string;
	detail: string;
}

const fieldsDetail = (fields: readonly FieldChange[]) =>
	fields
		.map(
			(field) =>
				`${field.label}: ${fieldValue(field, "from")} → ${fieldValue(field, "to")}`,
		)
		.join("; ");

/** Everything that changed between the two versions, in reading order. */
export const buildVersionChanges = (
	comparison: VersionComparison,
): VersionChangeItem[] => {
	const { from, to, demandDifferenceKva } = comparison;
	const demand =
		demandDifferenceKva === 0
			? []
			: [
					{
						title: "Demanda total",
						detail: `${formatKva(from.demandKva, 1)} → ${formatKva(to.demandKva, 1)} (${formatKvaDelta(demandDifferenceKva)} kVA)`,
					},
				];

	return [
		...demand,
		...comparison.building.map((field) => ({
			title: field.label,
			detail: `${fieldValue(field, "from")} → ${fieldValue(field, "to")}`,
		})),
		...comparison.included.map(({ name }) => ({
			title: `Grupo incluído: ${name}`,
			detail: `Novo na ${formatVersion(to.number)}.`,
		})),
		...comparison.removed.map(({ name }) => ({
			title: `Grupo removido: ${name}`,
			detail: `Estava na ${formatVersion(from.number)}.`,
		})),
		...comparison.changed.map(({ name, fields }) => ({
			title: `Grupo alterado: ${name}`,
			detail: fieldsDetail(fields),
		})),
	];
};

/** The pair to open first: the latest version against the one before it. */
export const defaultComparedVersions = (
	versions: readonly ProjectVersion[],
) => {
	const numbers = versions.map(({ number }) => number).sort((a, b) => a - b);
	const to = numbers.at(-1);
	const from = numbers.at(-2);

	return from !== undefined && to !== undefined ? { from, to } : null;
};
