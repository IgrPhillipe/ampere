import type { Finding } from "@services/project-review";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { FindingReferenceOptions } from "../../constants";
import { ReviewOpinion } from "./ReviewOpinion";

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

const approved = {
	status: "APPROVED",
	reviewOpinion: "Projeto em conformidade.",
	reviewerName: "Admin Teste",
	reviewedAt: "2026-10-10T12:00:00Z",
} as const;

describe("ReviewOpinion", () => {
	it("lists the reservations of an approved project", () => {
		render(
			<ReviewOpinion
				project={approved}
				reservations={[reservation]}
				referenceOptions={referenceOptions}
			/>,
		);

		expect(
			screen.getByRole("group", { name: /Ressalvas/ }),
		).toBeInTheDocument();
		expect(screen.getByText("Atualizar a data da ART.")).toBeInTheDocument();
		expect(screen.getByText("DIS-NOR-053, item 6.17")).toBeInTheDocument();
	});

	it("shows no reservations section without reservations", () => {
		render(
			<ReviewOpinion
				project={approved}
				reservations={[]}
				referenceOptions={referenceOptions}
			/>,
		);

		expect(screen.getByText("Projeto em conformidade.")).toBeInTheDocument();
		expect(screen.queryByText("Ressalvas")).not.toBeInTheDocument();
	});

	it("keeps the approval opinion and its reservations once expired", () => {
		render(
			<ReviewOpinion
				project={{ ...approved, status: "EXPIRED" }}
				reservations={[reservation]}
				referenceOptions={referenceOptions}
			/>,
		);

		expect(
			screen.getByRole("heading", { name: "Parecer da Aprovação" }),
		).toBeInTheDocument();
		expect(screen.getByText("Atualizar a data da ART.")).toBeInTheDocument();
	});
});
