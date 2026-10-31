import type { ProjectRework } from "@services/project-events";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ReworkPanel } from "./ReworkPanel";

const rework = (overrides: Partial<ProjectRework> = {}): ProjectRework => ({
	cycleDays: 10,
	submittedVersions: 1,
	reviewCycles: 1,
	resolvedFindings: 0,
	openFindings: 3,
	redoneCalculationSteps: 0,
	...overrides,
});

describe("ReworkPanel", () => {
	it("counts the days since the first submission while not approved", () => {
		render(<ReworkPanel rework={rework()} />);

		expect(screen.getByText("10")).toBeInTheDocument();
		expect(screen.getByText("Dias desde o primeiro envio")).toBeInTheDocument();
	});

	it("names the cycle up to the approval once approved", () => {
		render(<ReworkPanel rework={rework({ cycleDays: 1 })} approved />);

		expect(
			screen.getByText("Dia do primeiro envio à aprovação"),
		).toBeInTheDocument();
	});

	it("shows only the waiting caption before the first submission", () => {
		render(
			<ReworkPanel
				rework={rework({ cycleDays: null, submittedVersions: 0 })}
			/>,
		);

		expect(screen.getByText("Aguardando o primeiro envio")).toBeInTheDocument();
		expect(screen.queryByText("—")).not.toBeInTheDocument();
	});

	it.each([
		[1, 0, null],
		[2, 0, "Nenhuma etapa do cálculo precisou ser refeita entre as versões."],
		[
			2,
			1,
			"Uma etapa do cálculo mudou de valor entre o primeiro envio e a versão atual.",
		],
		[
			3,
			2,
			"2 etapas do cálculo mudaram de valor entre o primeiro envio e a versão atual.",
		],
	])("explains the redone steps of %s versions with %s changed", (submittedVersions, redoneCalculationSteps, note) => {
		render(
			<ReworkPanel
				rework={rework({ submittedVersions, redoneCalculationSteps })}
			/>,
		);

		if (note) expect(screen.getByText(note)).toBeInTheDocument();
		else expect(screen.queryByText(/etapa/)).toBeNull();
	});

	it("tells how many fixed findings wait for the analyst", () => {
		const { rerender } = render(
			<ReworkPanel rework={rework()} awaitingFindings={1} />,
		);

		expect(
			screen.getByText(
				"Um apontamento corrigido aguarda a conferência do analista.",
			),
		).toBeInTheDocument();

		rerender(<ReworkPanel rework={rework()} awaitingFindings={2} />);

		expect(
			screen.getByText(
				"2 apontamentos corrigidos aguardam a conferência do analista.",
			),
		).toBeInTheDocument();
	});
});
