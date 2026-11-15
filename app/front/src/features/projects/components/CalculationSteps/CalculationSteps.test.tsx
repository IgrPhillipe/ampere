import type { CalculationStep } from "@services/calculation";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CalculationSteps } from "./CalculationSteps";

const individual = (
	overrides: Partial<CalculationStep> = {},
): CalculationStep => ({
	index: 6,
	code: "Dind",
	title: "Demanda Individual dos Apartamentos",
	applies: true,
	formula: "Maior demanda individual trifásica: Cobertura, 18,40 kVA",
	details: ["Cobertura (trifásico, carga instalada de 32,00 kW): ..."],
	valueKva: 18.4,
	reference: null,
	...overrides,
});

describe("CalculationSteps", () => {
	it("shows the largest three-phase apartment demand apart from Ded", () => {
		render(<CalculationSteps steps={[individual()]} />);

		expect(
			screen.getByRole("heading", {
				name: /Demanda Individual dos Apartamentos/i,
			}),
		).toBeInTheDocument();
		expect(screen.getByText("18,40")).toBeInTheDocument();
		expect(
			screen.getByText(
				"Dimensiona cada apartamento e não entra na demanda da edificação.",
			),
		).toBeInTheDocument();
	});

	it("sizes single-phase apartments by their installed load", () => {
		render(
			<CalculationSteps
				steps={[
					individual({
						formula:
							"Só apartamentos monofásicos: a categoria sai da carga instalada (DIS-NOR-030, item 6.28.1)",
						valueKva: 0,
					}),
				]}
			/>,
		);

		expect(screen.getByText("Pela carga instalada")).toBeInTheDocument();
		expect(screen.queryByText("0,00")).not.toBeInTheDocument();
	});

	it("waits for the six steps while loading", () => {
		render(<CalculationSteps isLoading />);

		expect(screen.getByText("06 etapas")).toBeInTheDocument();
	});
});
