import type { ReviewerDistribution } from "@services/reviewer-distribution";
import { describe, expect, it } from "vitest";

import {
	getMunicipalityOptions,
	getMunicipalityOwners,
	getUnassignedMunicipalities,
} from "./municipality-ownership";

const distribution: ReviewerDistribution[] = [
	{
		reviewer: { id: "7", name: "Ana Analista" },
		municipalities: [
			{ state: "PE", municipality: "Caruaru" },
			{ state: "PE", municipality: "Gravatá" },
		],
	},
	{ reviewer: { id: "8", name: "Bruno Analista" }, municipalities: [] },
];

describe("municipality ownership", () => {
	it("maps each held municipality to its analyst", () => {
		const owners = getMunicipalityOwners(distribution);

		expect(owners.get("PE/Caruaru")).toEqual({ id: "7", name: "Ana Analista" });
		expect(owners.has("PE/Recife")).toBe(false);
	});

	it("lists the concession municipalities without an analyst", () => {
		const unassigned = getUnassignedMunicipalities(distribution).map(
			({ name }) => name,
		);

		expect(unassigned).toContain("Recife");
		expect(unassigned).toContain("Pedras de Fogo");
		expect(unassigned).not.toContain("Caruaru");
	});

	it("marks the municipalities another analyst holds", () => {
		const forBruno = getMunicipalityOptions(distribution, "8");
		const forAna = getMunicipalityOptions(distribution, "7");

		expect(forBruno.find(({ key }) => key === "PE/Caruaru")?.heldBy).toBe(
			"Ana Analista",
		);
		expect(forAna.find(({ key }) => key === "PE/Caruaru")?.heldBy).toBe(
			undefined,
		);
		expect(forBruno.find(({ key }) => key === "PE/Recife")?.heldBy).toBe(
			undefined,
		);
	});
});
