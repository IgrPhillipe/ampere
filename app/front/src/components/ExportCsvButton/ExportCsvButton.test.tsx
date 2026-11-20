import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ExportCsvButton } from "./ExportCsvButton";

describe("ExportCsvButton", () => {
	it("exports on click", () => {
		const onExport = vi.fn();
		render(<ExportCsvButton onExport={onExport} />);

		fireEvent.click(screen.getByRole("button", { name: "Exportar CSV" }));

		expect(onExport).toHaveBeenCalledOnce();
	});

	it("shows the progress and keeps the focus while the export runs", () => {
		const onExport = vi.fn();
		const { rerender } = render(<ExportCsvButton onExport={onExport} />);
		const button = screen.getByRole("button", { name: "Exportar CSV" });
		act(() => button.focus());

		rerender(<ExportCsvButton isPending onExport={onExport} />);
		fireEvent.click(button);

		expect(button).toHaveAccessibleName("Exportando...");
		expect(button).toHaveAttribute("aria-disabled", "true");
		expect(button).toHaveFocus();
		expect(onExport).not.toHaveBeenCalled();
	});
});
