import type { ProjectDetail } from "@services/projects";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProjectDetailHeader } from "./ProjectDetailHeader";

const baseProject = (overrides: Partial<ProjectDetail> = {}): ProjectDetail =>
	({
		id: "1",
		name: "Edifício Solar",
		address: "Rua do Sol, 100",
		municipality: "Recife",
		state: "PE",
		postalCode: "50030230",
		protocol: "2026-0001",
		status: "DRAFT",
		createdAt: "2026-10-16T12:00:00Z",
		updatedAt: "2026-10-16T12:00:00Z",
		submittedAt: null,
		ownerId: "1",
		ownerName: "Ana Lima",
		reviewerName: null,
		reviewedAt: null,
		reviewCycle: 0,
		reviewOpinion: null,
		changeSummary: null,
		buildingType: "RESIDENTIAL_MULTIFAMILY",
		floors: 4,
		voltage: "VOLTAGE_220_127",
		connectionType: "THREE_PHASE",
		entranceStandard: "AERIAL",
		standards: [{ name: "DIS-NOR-053", revision: "REV 06" }],
		applicableStandards: "DIS-NOR-053 REV 06",
		demandRules: [],
		technicalResponsible: { name: "Ana Carolina Lima", crea: "1684-D/PE" },
		...overrides,
	}) as unknown as ProjectDetail;

describe("ProjectDetailHeader", () => {
	it("exibe o responsável técnico com nome e CREA no carimbo", () => {
		render(
			<ProjectDetailHeader
				project={baseProject({
					technicalResponsible: {
						name: "Ana Carolina Lima",
						crea: "1684-D/PE",
					},
				})}
			/>,
		);

		expect(screen.getByText("Responsável técnico")).toBeInTheDocument();
		expect(
			screen.getByText("Ana Carolina Lima, CREA 1684-D/PE"),
		).toBeInTheDocument();
	});

	it("exibe o ownerName quando o projeto não tem technicalResponsible formatado", () => {
		render(
			<ProjectDetailHeader
				project={baseProject({
					technicalResponsible: null,
					ownerName: "Carlos Projetista",
				})}
			/>,
		);

		expect(screen.getByText("Carlos Projetista")).toBeInTheDocument();
	});
});
