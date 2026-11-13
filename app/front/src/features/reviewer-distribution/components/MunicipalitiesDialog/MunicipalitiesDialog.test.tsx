import type { ReviewerDistribution } from "@services/reviewer-distribution";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MunicipalitiesDialog } from "./MunicipalitiesDialog";

const ana: ReviewerDistribution = {
	reviewer: { id: "7", name: "Ana Analista" },
	municipalities: [{ state: "PE", municipality: "Caruaru" }],
};
const bruno: ReviewerDistribution = {
	reviewer: { id: "8", name: "Bruno Analista" },
	municipalities: [{ state: "PE", municipality: "Gravatá" }],
};

const renderDialog = (reviewer: ReviewerDistribution) => {
	const onSave = vi.fn();
	render(
		<MunicipalitiesDialog
			open
			reviewer={reviewer}
			distribution={[ana, bruno]}
			isPending={false}
			onOpenChange={vi.fn()}
			onSave={onSave}
		/>,
	);

	return onSave;
};

const openPicker = async (search: string) => {
	fireEvent.click(
		screen.getByRole("combobox", { name: "Adicionar município" }),
	);
	fireEvent.change(await screen.findByPlaceholderText("Buscar município"), {
		target: { value: search },
	});
};

describe("MunicipalitiesDialog", () => {
	it("refuses a municipality another analyst holds", async () => {
		const onSave = renderDialog(bruno);
		await openPicker("caruaru");

		const option = screen.getByRole("option", { name: /Caruaru \(PE\)/ });
		expect(option).toHaveAttribute("aria-disabled", "true");
		expect(option).toHaveTextContent("Com Ana Analista");

		fireEvent.pointerDown(option);
		fireEvent.click(option);
		fireEvent.click(screen.getByRole("button", { name: "Salvar Municípios" }));

		expect(onSave).toHaveBeenCalledWith([
			{ state: "PE", municipality: "Gravatá" },
		]);
	});

	it("saves the list with an added and a removed municipality", async () => {
		const onSave = renderDialog(ana);
		await openPicker("recife");

		const recife = screen.getByRole("option", { name: "Recife (PE)" });
		fireEvent.pointerDown(recife);
		fireEvent.click(recife);
		fireEvent.keyDown(document.activeElement ?? document.body, {
			key: "Escape",
		});

		fireEvent.click(screen.getByRole("button", { name: "Remover Caruaru/PE" }));
		fireEvent.click(screen.getByRole("button", { name: "Salvar Municípios" }));

		expect(onSave).toHaveBeenCalledWith([
			{ state: "PE", municipality: "Recife" },
		]);
	});
});
