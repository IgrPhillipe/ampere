import type { FindingReferenceOptions } from "@features/projects";
import type { Finding } from "@services/project-review";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DecisionDialog } from "./DecisionDialog";

const reservation: Finding = {
	id: "1",
	projectId: "4",
	severity: "ADJUSTMENT",
	stage: "DOCUMENTS",
	consumerUnitGroupId: null,
	calculationStepCode: null,
	documentType: "ART",
	description: "Atualizar a data da ART.",
	standardItem: "DIS-NOR-053, item 6.17",
	authorId: "2",
	authorName: "Admin Teste",
	createdAt: "2026-10-04T13:00:00Z",
	version: 1,
	status: "DRAFT",
	response: null,
	respondedAt: null,
};

const referenceOptions: FindingReferenceOptions = {
	PROJECT_DATA: {},
	CONSUMER_UNITS: {},
	CALCULATION: {},
	DOCUMENTS: { ART: "ART" },
};

const renderDialog = (reservations: Finding[]) =>
	render(
		<DecisionDialog
			decision="APPROVE"
			pendingCount={reservations.length}
			reservations={reservations}
			referenceOptions={referenceOptions}
			isPending={false}
			onOpenChange={vi.fn()}
			onConfirm={vi.fn()}
		/>,
	);

describe("DecisionDialog", () => {
	it("lists the reservations the approval keeps", () => {
		renderDialog([reservation]);

		expect(
			screen.getByText(
				"O status passa a Aprovado com 01 ressalva, registrada no parecer e no memorial. O projetista não responde ressalvas.",
			),
		).toBeInTheDocument();
		expect(screen.getByRole("region", { name: "Ressalvas" })).toHaveTextContent(
			"Atualizar a data da ART.",
		);
	});

	it("approves without a reservations list when nothing is pending", () => {
		renderDialog([]);

		expect(
			screen.getByText(
				"O status passa a Aprovado e o parecer fica registrado na análise.",
			),
		).toBeInTheDocument();
		expect(
			screen.queryByRole("region", { name: "Ressalvas" }),
		).not.toBeInTheDocument();
	});
});
