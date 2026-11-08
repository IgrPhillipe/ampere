import type { FindingReferenceOptions } from "@features/projects";
import type { Finding } from "@services/project-review";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FindingCard } from "./FindingCard";

const finding: Finding = {
	id: "1",
	projectId: "4",
	severity: "ADJUSTMENT",
	stage: "DOCUMENTS",
	consumerUnitGroupId: null,
	calculationStepCode: null,
	documentType: "ART",
	description: "Atualizar a data da ART.",
	standardItem: null,
	authorId: "2",
	authorName: "Admin Teste",
	createdAt: "2026-10-04T13:00:00Z",
	version: 1,
	status: "OPEN",
	response: null,
	respondedAt: null,
};

const referenceOptions: FindingReferenceOptions = {
	PROJECT_DATA: {},
	CONSUMER_UNITS: {},
	CALCULATION: {},
	DOCUMENTS: { ART: "ART" },
};

const renderCard = (overrides: Partial<Finding>, reservation = false) =>
	render(
		<FindingCard
			finding={{ ...finding, ...overrides }}
			reservation={reservation}
			referenceOptions={referenceOptions}
			editable
			onEdit={vi.fn()}
			onDelete={vi.fn()}
			onResolve={vi.fn()}
		/>,
	);

describe("FindingCard", () => {
	it("accepts a finding the designer never answered", () => {
		renderCard({});

		expect(screen.getByRole("button", { name: "Aceitar" })).toBeInTheDocument();
	});

	it("reads an unresolved finding of an approved project as a reservation", () => {
		renderCard({}, true);

		expect(screen.getByText("Ressalva")).toBeInTheDocument();
		expect(
			screen.getByText("Ressalva da aprovação: o projetista não responde."),
		).toBeInTheDocument();
		expect(screen.queryByText("Aberto")).not.toBeInTheDocument();
	});

	it("accepts the correction of an answered finding", () => {
		renderCard({
			status: "FIXED",
			response: "Data atualizada.",
			respondedAt: "2026-10-06T12:00:00Z",
		});

		expect(
			screen.getByRole("button", { name: "Aceitar Correção" }),
		).toBeInTheDocument();
	});
});
