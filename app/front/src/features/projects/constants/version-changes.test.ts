import type {
	ProjectVersion,
	VersionComparison,
} from "@services/project-versions";
import { describe, expect, it } from "vitest";

import {
	buildVersionChanges,
	defaultComparedVersions,
	fieldValue,
	formatKvaDelta,
	formatVersion,
} from "./version-changes";

const comparisonOf = (
	overrides: Partial<VersionComparison> = {},
): VersionComparison => ({
	from: { number: 1, submittedAt: "2026-08-20T12:00:00Z", demandKva: 100 },
	to: { number: 2, submittedAt: "2026-08-28T12:00:00Z", demandKva: 100 },
	demandDifferenceKva: 0,
	included: [],
	removed: [],
	changed: [],
	building: [],
	...overrides,
});

describe("version changes", () => {
	it("formats versions and deltas", () => {
		expect(formatVersion(3)).toBe("v03");
		expect(formatKvaDelta(2.44)).toBe("+2,4");
		expect(formatKvaDelta(-1)).toBe("−1,0");
		expect(formatKvaDelta(0)).toBe("—");
	});

	it("prefers the readable value of a field", () => {
		const change = {
			field: "connection",
			label: "Ligação",
			from: "SINGLE_PHASE",
			to: "THREE_PHASE",
			fromLabel: "Monofásica",
			toLabel: null,
		};

		expect(fieldValue(change, "from")).toBe("Monofásica");
		expect(fieldValue(change, "to")).toBe("THREE_PHASE");
		expect(fieldValue({ ...change, to: null }, "to")).toBe("—");
	});

	it("lists nothing when the versions are equal", () => {
		expect(buildVersionChanges(comparisonOf())).toEqual([]);
	});

	it("lists demand, building and groups in reading order", () => {
		const changes = buildVersionChanges(
			comparisonOf({
				to: {
					number: 2,
					submittedAt: "2026-08-28T12:00:00Z",
					demandKva: 102.5,
				},
				demandDifferenceKva: 2.5,
				building: [
					{
						field: "floors",
						label: "Pavimentos",
						from: "10",
						to: "12",
						fromLabel: null,
						toLabel: null,
					},
				],
				included: [{ id: "3", name: "Recarga", fields: [] }],
				removed: [{ id: "1", name: "Lojas", fields: [] }],
				changed: [
					{
						id: "2",
						name: "Tipo A",
						fields: [
							{
								field: "unitCount",
								label: "Unidades",
								from: "24",
								to: "26",
								fromLabel: null,
								toLabel: null,
							},
						],
					},
				],
			}),
		);

		expect(changes).toEqual([
			{
				title: "Demanda total",
				detail: "100,0 kVA → 102,5 kVA (+2,5 kVA)",
			},
			{ title: "Pavimentos", detail: "10 → 12" },
			{ title: "Grupo incluído: Recarga", detail: "Novo na v02." },
			{ title: "Grupo removido: Lojas", detail: "Estava na v01." },
			{ title: "Grupo alterado: Tipo A", detail: "Unidades: 24 → 26" },
		]);
	});

	it("compares the latest version with the one before it", () => {
		const versionOf = (number: number) => ({ number }) as ProjectVersion;

		expect(
			defaultComparedVersions([versionOf(2), versionOf(1), versionOf(3)]),
		).toEqual({
			from: 2,
			to: 3,
		});
		expect(defaultComparedVersions([versionOf(1)])).toBeNull();
	});
});
