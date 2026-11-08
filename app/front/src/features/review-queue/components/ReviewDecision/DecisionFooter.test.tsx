import type { Finding } from "@services/project-review";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DecisionFooter } from "./DecisionFooter";
import { getDecisionAvailability } from "./review-decision";

const adjustment: Finding = {
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
	status: "DRAFT",
	response: null,
	respondedAt: null,
};

const renderFooter = (findings: Finding[]) => {
	const onDecide = vi.fn();
	render(
		<DecisionFooter
			availability={getDecisionAvailability(findings)}
			canDecide
			onDecide={onDecide}
		/>,
	);

	return onDecide;
};

describe("DecisionFooter", () => {
	it("offers both decisions while only adjustments are pending", () => {
		const onDecide = renderFooter([adjustment]);

		fireEvent.click(screen.getByRole("button", { name: "Aprovar Projeto" }));
		fireEvent.click(
			screen.getByRole("button", { name: "Reprovar com Apontamentos" }),
		);

		expect(onDecide).toHaveBeenNthCalledWith(1, "APPROVE");
		expect(onDecide).toHaveBeenNthCalledWith(2, "REJECT");
	});

	it("tells why the approval is blocked with a pending blocking finding", () => {
		renderFooter([{ ...adjustment, severity: "BLOCKING" }]);

		expect(
			screen.getByRole("button", { name: "Aprovar Projeto" }),
		).toBeDisabled();
		expect(
			screen.getByRole("button", { name: "Reprovar com Apontamentos" }),
		).toBeInTheDocument();
		expect(
			screen.getByText(
				"Resolva ou exclua os apontamentos bloqueantes para aprovar.",
			),
		).toBeInTheDocument();
	});
});
