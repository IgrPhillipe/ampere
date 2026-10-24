import type { Finding } from "@services/project-review";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { FindingReferenceOptions } from "../../constants";
import { ProjectFindingsOverview } from "./ProjectFindingsOverview";

const makeFinding = (overrides: Partial<Finding> = {}): Finding => ({
	id: "1",
	projectId: "4",
	severity: "BLOCKING",
	stage: "DOCUMENTS",
	consumerUnitGroupId: null,
	calculationStepCode: null,
	documentType: "ART",
	description: "A ART não traz a assinatura do responsável técnico.",
	standardItem: null,
	authorId: "2",
	authorName: "Admin Teste",
	createdAt: "2026-10-04T13:00:00Z",
	version: 1,
	status: "OPEN",
	response: null,
	respondedAt: null,
	...overrides,
});

const referenceOptions: FindingReferenceOptions = {
	PROJECT_DATA: {},
	CONSUMER_UNITS: { "7": "Apartamento tipo B" },
	CALCULATION: {},
	DOCUMENTS: { ART: "ART" },
};

const rejected = {
	status: "REJECTED",
	reviewCycle: 1,
	reviewOpinion: "Corrija os documentos indicados.",
} as const;

const renderOverview = (
	findings: Finding[],
	project: {
		status: "REJECTED" | "UNDER_REVIEW";
		reviewCycle: number;
		reviewOpinion: string | null;
	} = rejected,
	canRespond = true,
) => {
	const onStartResponse = vi.fn();
	render(
		<ProjectFindingsOverview
			findings={findings}
			project={project}
			referenceOptions={referenceOptions}
			canRespond={canRespond}
			isResponding={false}
			onOpenStage={vi.fn()}
			onStartResponse={onStartResponse}
			onSubmitResponse={vi.fn()}
			onCancelResponse={vi.fn()}
		/>,
	);

	return { onStartResponse };
};

describe("ProjectFindingsOverview", () => {
	it("orders blocking findings first and starts a response", () => {
		const adjustment = makeFinding({
			id: "1",
			severity: "ADJUSTMENT",
			stage: "PROJECT_DATA",
			documentType: null,
			description: "Ajustar endereço.",
		});
		const blocking = makeFinding({ id: "2", description: "Substituir ART." });
		const { onStartResponse } = renderOverview([adjustment, blocking]);

		const descriptions = screen.getAllByText(/Ajustar endereço|Substituir ART/);
		expect(descriptions[0]).toHaveTextContent("Substituir ART.");

		fireEvent.click(screen.getByRole("button", { name: /Substituir ART/ }));
		fireEvent.click(screen.getByRole("button", { name: "Contestar" }));
		expect(onStartResponse).toHaveBeenCalledWith(blocking, "CONTESTED");
	});

	it("shows the findings without answers to a profile that does not respond", () => {
		renderOverview(
			[makeFinding({ description: "Substituir ART." })],
			rejected,
			false,
		);

		expect(screen.getByText("Substituir ART.")).toBeVisible();
		expect(
			screen.queryByRole("button", { name: "Contestar" }),
		).not.toBeInTheDocument();
	});

	it("names the group a finding points to", () => {
		renderOverview([
			makeFinding({
				stage: "CONSUMER_UNITS",
				documentType: null,
				consumerUnitGroupId: "7",
			}),
		]);

		expect(
			screen.getByText("Unidades Consumidoras: Apartamento tipo B"),
		).toBeVisible();
	});

	it("leaves out the findings already answered or accepted", () => {
		renderOverview(
			[
				makeFinding({ id: "1", status: "RESOLVED", description: "Aceito." }),
				makeFinding({
					id: "2",
					status: "CONTESTED",
					description: "Contestado.",
					response: "O documento já está assinado na página 2.",
				}),
				makeFinding({ id: "3", status: "OPEN", description: "Em aberto." }),
			],
			{ ...rejected, reviewCycle: 2 },
		);

		expect(screen.getByText("Em aberto.")).toBeVisible();
		expect(screen.queryByText("Aceito.")).not.toBeInTheDocument();
		expect(screen.queryByText("Contestado.")).not.toBeInTheDocument();
		expect(
			screen.queryByRole("region", { name: "Histórico" }),
		).not.toBeInTheDocument();
	});

	it("offers no response while the project is under review", () => {
		renderOverview([makeFinding()], {
			status: "UNDER_REVIEW",
			reviewCycle: 1,
			reviewOpinion: null,
		});

		expect(
			screen.queryByRole("button", { name: "Contestar" }),
		).not.toBeInTheDocument();
	});
});
