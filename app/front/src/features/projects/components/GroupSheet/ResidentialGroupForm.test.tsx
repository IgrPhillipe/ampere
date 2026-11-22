import type {
	ConsumerUnitGroupPayload,
	ResidentialGroup,
} from "@services/consumer-units";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ResidentialGroupForm } from "./ResidentialGroupForm";

const makeGroup = (
	overrides: Partial<ResidentialGroup> = {},
): ResidentialGroup => ({
	id: "101",
	name: "Apartamentos Tipo",
	kind: "RESIDENTIAL",
	quantity: 12,
	status: "VALIDATED",
	issues: [],
	summary: "80 m², 2 quartos, monofásico (DIS-NOR-053 Quadro 35)",
	declaredLoadKw: 120,
	loadPerUnitKw: 10,
	usefulArea: 80,
	bedrooms: 2,
	unitLoadKw: 10,
	compactUnit: false,
	connectionType: "SINGLE_PHASE",
	loads: null,
	...overrides,
});

const shower = {
	category: "INSTANT_HEATING" as const,
	description: "Chuveiro",
	quantity: 2,
	power: 5.5,
	powerUnit: "KW" as const,
};

const renderForm = (group: ResidentialGroup, focusField?: string) => {
	const onSave = vi.fn<(payload: ConsumerUnitGroupPayload) => void>();
	render(
		<ResidentialGroupForm
			group={group}
			focusField={focusField}
			readOnly={false}
			isSaving={false}
			isDeleting={false}
			onSave={onSave}
			onCancel={vi.fn()}
			onDelete={vi.fn()}
		/>,
	);
	return onSave;
};

const pickConnection = async (option: string) => {
	fireEvent.click(
		screen.getByRole("combobox", { name: /Ligação do apartamento/i }),
	);
	const item = await screen.findByRole("option", { name: option });
	fireEvent.pointerDown(item);
	fireEvent.click(item);
	await waitFor(() => expect(screen.queryAllByRole("option")).toHaveLength(0));
};

const save = () =>
	fireEvent.click(screen.getByRole("button", { name: /Salvar Grupo/i }));

const unitLoadField = () =>
	screen.queryByRole("spinbutton", { name: /Carga instalada por unidade/i });

describe("ResidentialGroupForm", () => {
	describe("single-phase", () => {
		it("keeps the total load per unit and sends no loads", async () => {
			const onSave = renderForm(makeGroup());

			expect(unitLoadField()).toBeInTheDocument();
			expect(
				screen.queryByRole("heading", { name: "Cargas do Apartamento" }),
			).not.toBeInTheDocument();

			save();

			await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
			expect(onSave.mock.calls[0][0]).toMatchObject({
				connectionType: "SINGLE_PHASE",
				unitLoadKw: 10,
				loads: null,
			});
		});

		it("warns above the 15 kW ceiling of the single-phase connection", async () => {
			renderForm(makeGroup());

			fireEvent.change(unitLoadField() as HTMLElement, {
				target: { value: "18" },
			});

			expect(await screen.findByRole("status")).toHaveTextContent(
				"passa de 15 kW, teto da ligação monofásica",
			);
		});

		it("warns above the 75 kW low-voltage limit", async () => {
			renderForm(makeGroup());

			fireEvent.change(unitLoadField() as HTMLElement, {
				target: { value: "80" },
			});

			expect(await screen.findByRole("status")).toHaveTextContent(
				"Carga instalada de 80,00 kW por unidade passa do limite de 75 kW da baixa tensão (DIS-NOR-030, item 6.2.1).",
			);
		});

		it("asks for the connection when the group has none", async () => {
			const onSave = renderForm(makeGroup({ connectionType: null }));

			save();

			expect(
				await screen.findByText("Selecione a ligação do apartamento."),
			).toBeInTheDocument();
			expect(onSave).not.toHaveBeenCalled();
		});
	});

	describe("three-phase", () => {
		const threePhase = (overrides: Partial<ResidentialGroup> = {}) =>
			makeGroup({
				connectionType: "THREE_PHASE",
				// The API sends the sum of the loads.
				unitLoadKw: 11,
				loads: [shower],
				...overrides,
			});

		it("shows the load composition instead of the total load", () => {
			renderForm(threePhase());

			expect(unitLoadField()).not.toBeInTheDocument();
			expect(
				screen.getByRole("heading", { name: /Cargas do Apartamento/i }),
			).toBeInTheDocument();
			expect(screen.getByDisplayValue("Chuveiro")).toBeInTheDocument();
			expect(screen.getByText("11,00 kW")).toBeInTheDocument();
		});

		it("sends the loads and no total load", async () => {
			const onSave = renderForm(threePhase());

			save();

			await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
			expect(onSave.mock.calls[0][0]).toMatchObject({
				connectionType: "THREE_PHASE",
				unitLoadKw: null,
				loads: [shower],
			});
		});

		it("refuses to save without loads", async () => {
			const onSave = renderForm(threePhase());

			fireEvent.click(screen.getByRole("button", { name: /Remover Carga/i }));
			save();

			expect(await screen.findByRole("alert")).toHaveTextContent(
				"Detalhe as cargas do apartamento trifásico.",
			);
			expect(onSave).not.toHaveBeenCalled();
		});

		it("focuses the first load power for an issue on the whole list", async () => {
			renderForm(threePhase(), "loads");

			await waitFor(() => {
				expect(
					screen.getByRole("spinbutton", { name: /Potência de placa/i }),
				).toHaveFocus();
			});
		});

		it("focuses the load field the back points to", async () => {
			renderForm(threePhase(), "loads[0].description");

			await waitFor(() => {
				expect(
					screen.getByRole("textbox", { name: /Descrição/i }),
				).toHaveFocus();
			});
		});

		it("warns when the loads add up past the low-voltage limit", async () => {
			renderForm(
				threePhase({
					loads: [
						{ ...shower, quantity: 10, power: 7 },
						{
							category: "MOTORS",
							description: "Bomba",
							quantity: 1,
							power: 20,
							powerUnit: "CV",
						},
					],
				}),
			);

			expect(
				await screen.findByText(
					/Carga instalada de 84,71 kW por unidade passa do limite de 75 kW/,
				),
			).toBeInTheDocument();
		});

		it("says the loads rated by a table only add up on save", async () => {
			renderForm(
				threePhase({
					loads: [
						shower,
						{
							category: "AIR_CONDITIONING",
							description: "Condicionador de ar",
							quantity: 2,
							power: 14000,
							powerUnit: "BTU_H",
						},
					],
				}),
			);

			expect(await screen.findByRole("status")).toHaveTextContent(
				"Condicionadores em BTU/h, motores e bombas em CV ou HP entram pela tabela da norma ao salvar. O total e o limite de 75 kW só se confirmam depois disso.",
			);
			expect(screen.getByText(/Total parcial/)).toBeInTheDocument();
		});

		it("gives no table notice when every load is read by its plate", () => {
			renderForm(threePhase());

			expect(screen.queryByRole("status")).not.toBeInTheDocument();
			expect(screen.queryByText(/Total parcial/)).not.toBeInTheDocument();
		});
	});

	it("starts the loads with one empty row when switching to three-phase", async () => {
		renderForm(makeGroup());

		await pickConnection("Trifásico");

		expect(unitLoadField()).not.toBeInTheDocument();
		const description = screen.getByRole("textbox", { name: /Descrição/i });
		expect(description).toHaveValue("");
		expect(description).toHaveAttribute("placeholder", "Ex.: Chuveiro");
	});

	it("drops the total load when switching to three-phase", async () => {
		renderForm(makeGroup());

		await pickConnection("Trifásico");
		await pickConnection("Monofásico");

		expect(unitLoadField()).toHaveValue(null);
	});

	it("drops the loads when switching back to single-phase", async () => {
		const onSave = renderForm(
			makeGroup({
				connectionType: "THREE_PHASE",
				unitLoadKw: 11,
				loads: [shower],
			}),
		);

		await pickConnection("Monofásico");
		expect(unitLoadField()).toHaveValue(null);
		fireEvent.change(unitLoadField() as HTMLElement, {
			target: { value: "9" },
		});
		save();

		await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
		expect(onSave.mock.calls[0][0]).toMatchObject({
			connectionType: "SINGLE_PHASE",
			unitLoadKw: 9,
			loads: null,
		});
	});
});
