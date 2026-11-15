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

const renderForm = (group: ResidentialGroup) => {
	const onSave = vi.fn<(payload: ConsumerUnitGroupPayload) => void>();
	render(
		<ResidentialGroupForm
			group={group}
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
				unitLoadKw: null,
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
	});

	it("starts the loads with one empty row when switching to three-phase", async () => {
		renderForm(makeGroup());

		await pickConnection("Trifásico");

		expect(unitLoadField()).not.toBeInTheDocument();
		expect(screen.getByRole("textbox", { name: /Descrição/i })).toHaveValue("");
	});

	it("drops the loads when switching back to single-phase", async () => {
		const onSave = renderForm(
			makeGroup({
				connectionType: "THREE_PHASE",
				unitLoadKw: null,
				loads: [shower],
			}),
		);

		await pickConnection("Monofásico");
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
