import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CalculationExportButton } from "./CalculationExportButton";

const exportButton = () =>
	screen.getByRole("button", { name: /Exportar Planilha|Exportando/ });

const showHint = (target: HTMLElement, hint: string) => {
	act(() => target.focus());
	return screen.findByText(hint);
};

describe("CalculationExportButton", () => {
	it("exports when the calculation is ready", () => {
		const onExport = vi.fn();
		render(<CalculationExportButton onExport={onExport} />);

		fireEvent.click(exportButton());

		expect(onExport).toHaveBeenCalledOnce();
	});

	it.each([
		[
			"noCalculation",
			"É preciso calcular a demanda antes de exportar a planilha.",
		],
		["outdated", "Recalcule a demanda antes de exportar a planilha."],
		[
			"error",
			"Não foi possível carregar o cálculo. Tente novamente antes de exportar.",
		],
	] as const)("explains why a %s project cannot export", async (blocker, hint) => {
		render(<CalculationExportButton blocker={blocker} onExport={vi.fn()} />);

		expect(exportButton()).toBeDisabled();
		expect(
			await showHint(exportButton().parentElement as HTMLElement, hint),
		).toBeInTheDocument();
	});

	it("keeps the focus on the button while the export runs", async () => {
		const onExport = vi.fn();
		const { rerender } = render(
			<CalculationExportButton onExport={onExport} />,
		);
		const button = exportButton();
		act(() => button.focus());

		rerender(<CalculationExportButton isPending onExport={onExport} />);

		expect(exportButton()).toBe(button);
		expect(button).toHaveFocus();
		expect(button).toHaveTextContent("Exportando...");
		expect(button).toHaveAttribute("aria-disabled", "true");
		fireEvent.click(button);
		expect(onExport).not.toHaveBeenCalled();
		act(() => button.blur());
		expect(
			await showHint(button, "Aguarde a exportação da planilha."),
		).toBeInTheDocument();
	});
});
