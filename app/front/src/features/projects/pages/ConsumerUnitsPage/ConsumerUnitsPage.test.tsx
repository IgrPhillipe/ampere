import type {
	ConsumerUnitGroup,
	ConsumerUnitGroupResponse,
} from "@services/consumer-units";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	idleMutation,
	loadedQuery,
	makeProjectDetail,
	signInAs,
} from "@/test/fixtures/project-detail";

import { ConsumerUnitsPage } from "./ConsumerUnitsPage";

const state = vi.hoisted(() => ({
	project: undefined as unknown,
	groups: [] as ConsumerUnitGroup[],
	validation: {
		canCalculate: true,
		pendingCount: 0,
		totalDeclaredLoadKw: 100,
		groups: [],
	},
	createGroup: undefined as unknown as ReturnType<typeof idleMutation>,
	updateGroup: undefined as unknown as ReturnType<typeof idleMutation>,
	deleteGroup: undefined as unknown as ReturnType<typeof idleMutation>,
}));

vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => vi.fn(),
	Link: ({ children }: { children: ReactNode }) => <a href="/">{children}</a>,
}));

vi.mock("@services/projects", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/projects")>()),
	useGetProject: () => loadedQuery({ data: state.project }),
}));

vi.mock("@services/project-review", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/project-review")>()),
	useGetFindingList: () => loadedQuery({ data: [] }),
}));

vi.mock("@services/consumer-units", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/consumer-units")>()),
	useGetConsumerUnitGroupList: () => loadedQuery({ data: state.groups }),
	useGetConsumerUnitGroupValidation: () =>
		loadedQuery({ data: state.validation }),
	useCreateConsumerUnitGroup: () => state.createGroup,
	useUpdateConsumerUnitGroup: () => state.updateGroup,
	useDeleteConsumerUnitGroup: () => state.deleteGroup,
}));

vi.mock("@services/calculation", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/calculation")>()),
	useRunCalculation: () => idleMutation(),
}));

const renderPage = (projectId = "4") =>
	render(
		<QueryClientProvider client={new QueryClient()}>
			<ConsumerUnitsPage projectId={projectId} />
		</QueryClientProvider>,
	);

const pickUsage = async (option: string) => {
	const triggers = screen.getAllByRole("combobox", {
		name: /Tipo de uso/i,
	});
	fireEvent.click(triggers[0]);
	const item = await screen.findByRole("option", { name: option });
	fireEvent.pointerDown(item);
	fireEvent.click(item);
	await waitFor(() => expect(screen.queryAllByRole("option")).toHaveLength(0));
};

const respondWith = (group: ConsumerUnitGroup) => ({
	...idleMutation(),
	mutate: vi.fn((_args, options) => {
		const response: ConsumerUnitGroupResponse = { data: group };
		options?.onSuccess?.(response);
	}),
});

const submitNewGroup = async (
	name: string,
	usage: string,
	quantity: string,
) => {
	fireEvent.click(
		screen.getAllByRole("button", { name: /Adicionar Grupo/i })[0],
	);
	fireEvent.change(screen.getAllByPlaceholderText("Nome do grupo")[0], {
		target: { value: name },
	});
	await pickUsage(usage);
	fireEvent.change(screen.getAllByPlaceholderText("00")[0], {
		target: { value: quantity },
	});
	fireEvent.click(screen.getAllByRole("button", { name: /Salvar Grupo/i })[0]);
};

const missingData = (field: string) => ({
	severity: "MISSING_DATA" as const,
	field,
	message: "Informe o dado.",
});

const makeLoadGroup = (
	overrides: Partial<Extract<ConsumerUnitGroup, { kind: "LOAD" }>> = {},
): ConsumerUnitGroup => ({
	id: "102",
	name: "Administração",
	kind: "LOAD",
	usage: "COMMON_AREA",
	quantity: 1,
	status: "MISSING_DATA",
	issues: [],
	declaredLoadKw: 0,
	summary: "1 unidade",
	items: [],
	...overrides,
});

describe("ConsumerUnitsPage", () => {
	beforeEach(() => {
		signInAs("user");
		state.project = makeProjectDetail({ id: "4", status: "DRAFT" });
		state.groups = [];
		state.createGroup = idleMutation();
		state.updateGroup = idleMutation();
		state.deleteGroup = idleMutation();
	});

	it("saves a new residential group and opens its GroupSheet", async () => {
		state.createGroup = respondWith({
			id: "101",
			name: "Apartamentos Tipo",
			kind: "RESIDENTIAL",
			quantity: 12,
			status: "VALIDATED",
			issues: [],
			declaredLoadKw: 180,
			summary: "12 unidades",
			unitLoadKw: 15,
			usefulArea: null,
			bedrooms: null,
			compactUnit: null,
		});

		renderPage();
		await submitNewGroup("Apartamentos Tipo", "Apartamento", "12");

		await waitFor(() => {
			expect(state.createGroup.mutate).toHaveBeenCalledTimes(1);
			expect(
				screen.getByRole("heading", { name: "Apartamentos Tipo" }),
			).toBeInTheDocument();
		});
	});

	it("creates a new residential group as single-phase", async () => {
		renderPage();
		await submitNewGroup("Apartamentos Tipo", "Apartamento", "12");

		await waitFor(() => {
			expect(state.createGroup.mutate).toHaveBeenCalledTimes(1);
		});
		expect(state.createGroup.mutate.mock.calls[0][0]).toMatchObject({
			payload: { kind: "RESIDENTIAL", connectionType: "SINGLE_PHASE" },
		});
	});

	it("opens a three-phase apartment unsaved until its loads are in", async () => {
		renderPage();
		fireEvent.click(
			screen.getAllByRole("button", { name: /Adicionar Grupo/i })[0],
		);
		fireEvent.change(screen.getAllByPlaceholderText("Nome do grupo")[0], {
			target: { value: "Cobertura" },
		});
		await pickUsage("Apartamento");
		fireEvent.click(
			screen.getAllByRole("combobox", { name: /Ligação do apartamento/i })[0],
		);
		const threePhase = await screen.findByRole("option", {
			name: "Trifásico",
		});
		expect(
			screen.getAllByRole("spinbutton", {
				name: /Carga instalada por unidade/i,
			}),
		).not.toHaveLength(0);
		fireEvent.pointerDown(threePhase);
		fireEvent.click(threePhase);
		// The loads go in the sheet, so the row drops the total.
		await waitFor(() =>
			expect(
				screen.queryAllByRole("spinbutton", {
					name: /Carga instalada por unidade/i,
				}),
			).toHaveLength(0),
		);
		fireEvent.change(screen.getAllByPlaceholderText("00")[0], {
			target: { value: "2" },
		});
		fireEvent.click(
			screen.getAllByRole("button", { name: /Salvar Grupo/i })[0],
		);

		const description = await screen.findByRole("textbox", {
			name: /Descrição/i,
		});
		expect(state.createGroup.mutate).not.toHaveBeenCalled();
		expect(
			screen.queryByRole("button", { name: /Excluir Grupo/i }),
		).not.toBeInTheDocument();

		fireEvent.change(description, { target: { value: "Chuveiro" } });
		fireEvent.change(
			screen.getByRole("spinbutton", { name: /Potência de placa/i }),
			{ target: { value: "5.5" } },
		);
		fireEvent.click(
			screen
				.getAllByRole("button", { name: /Salvar Grupo/i })
				.at(-1) as HTMLElement,
		);

		await waitFor(() => {
			expect(state.createGroup.mutate).toHaveBeenCalledTimes(1);
		});
		expect(state.createGroup.mutate.mock.calls[0][0]).toMatchObject({
			payload: {
				kind: "RESIDENTIAL",
				name: "Cobertura",
				quantity: 2,
				connectionType: "THREE_PHASE",
				unitLoadKw: null,
				loads: [{ description: "Chuveiro", power: 5.5 }],
			},
		});
	});

	it("keeps the new row until the three-phase apartment is saved", async () => {
		const threePhaseRow = async () => {
			fireEvent.click(
				screen.getAllByRole("combobox", {
					name: /Ligação do apartamento/i,
				})[0],
			);
			const option = await screen.findByRole("option", { name: "Trifásico" });
			fireEvent.pointerDown(option);
			fireEvent.click(option);
			await waitFor(() =>
				expect(screen.queryAllByRole("option")).toHaveLength(0),
			);
		};
		const saveRow = () =>
			fireEvent.click(
				screen.getAllByRole("button", { name: /Salvar Grupo/i })[0],
			);

		renderPage();
		fireEvent.click(
			screen.getAllByRole("button", { name: /Adicionar Grupo/i })[0],
		);
		fireEvent.change(screen.getAllByPlaceholderText("Nome do grupo")[0], {
			target: { value: "Cobertura" },
		});
		await pickUsage("Apartamento");
		await threePhaseRow();
		fireEvent.change(screen.getAllByPlaceholderText("00")[0], {
			target: { value: "2" },
		});
		saveRow();

		const sheet = await screen.findByRole("dialog");
		fireEvent.click(within(sheet).getByRole("button", { name: "Cancelar" }));
		await waitFor(() =>
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
		);
		expect(screen.getAllByPlaceholderText("Nome do grupo")[0]).toHaveValue(
			"Cobertura",
		);
		expect(screen.getAllByPlaceholderText("00")[0]).toHaveValue(2);

		state.createGroup = respondWith({
			id: "103",
			name: "Cobertura",
			kind: "RESIDENTIAL",
			quantity: 2,
			status: "MISSING_DATA",
			issues: [missingData("usefulArea")],
			declaredLoadKw: 11,
			summary: "Área útil não informada, trifásico (DIS-NOR-053 Quadro 35)",
			unitLoadKw: 5.5,
			connectionType: "THREE_PHASE",
			loads: [
				{
					category: "INSTANT_HEATING",
					description: "Chuveiro",
					quantity: 1,
					power: 5.5,
					powerUnit: "KW",
				},
			],
		});
		saveRow();
		fireEvent.change(
			await screen.findByRole("textbox", { name: /Descrição/i }),
			{ target: { value: "Chuveiro" } },
		);
		fireEvent.change(
			screen.getByRole("spinbutton", { name: /Potência de placa/i }),
			{ target: { value: "5.5" } },
		);
		fireEvent.click(
			within(screen.getByRole("dialog")).getByRole("button", {
				name: /Salvar Grupo/i,
			}),
		);

		await waitFor(() =>
			expect(screen.queryByPlaceholderText("Nome do grupo")).toBeNull(),
		);
	});

	it("shows each apartment's connection in the groups table", () => {
		state.groups = [
			{
				id: "103",
				name: "Cobertura",
				kind: "RESIDENTIAL",
				quantity: 2,
				status: "VALIDATED",
				issues: [],
				declaredLoadKw: 32,
				summary: "180 m², trifásico (DIS-NOR-053 Quadro 35)",
				usefulArea: 180,
				unitLoadKw: 16,
				connectionType: "THREE_PHASE",
				loads: [
					{
						category: "INSTANT_HEATING",
						description: "Chuveiro",
						quantity: 4,
						power: 4,
						powerUnit: "KW",
					},
				],
			},
			{
				id: "104",
				name: "Apartamentos Tipo",
				kind: "RESIDENTIAL",
				quantity: 12,
				status: "VALIDATED",
				issues: [],
				declaredLoadKw: 120,
				summary: "80 m², monofásico (DIS-NOR-053 Quadro 35)",
				usefulArea: 80,
				unitLoadKw: 10,
				connectionType: "SINGLE_PHASE",
				loads: null,
			},
			makeLoadGroup(),
		];

		renderPage();

		expect(
			screen.getByRole("columnheader", { name: "Ligação" }),
		).toBeInTheDocument();
		expect(screen.getAllByText("Trifásico").length).toBeGreaterThan(0);
		expect(screen.getAllByText("Monofásico").length).toBeGreaterThan(0);
		expect(screen.getAllByText("Edificação").length).toBeGreaterThan(0);
	});

	it("keeps the connection and the loads of a three-phase apartment on save", async () => {
		const loads = [
			{
				category: "INSTANT_HEATING" as const,
				description: "Chuveiro",
				quantity: 4,
				power: 4,
				powerUnit: "KW" as const,
			},
		];
		state.groups = [
			{
				id: "103",
				name: "Cobertura",
				kind: "RESIDENTIAL",
				quantity: 2,
				status: "VALIDATED",
				issues: [],
				declaredLoadKw: 32,
				summary: "180 m², 3 quartos, trifásico (DIS-NOR-053 Quadro 35)",
				usefulArea: 180,
				bedrooms: 3,
				unitLoadKw: 16,
				compactUnit: false,
				connectionType: "THREE_PHASE",
				loads,
			},
		];

		renderPage();
		fireEvent.click(screen.getAllByRole("button", { name: "Cobertura" })[0]);
		fireEvent.click(
			await screen.findByRole("button", { name: /Salvar Grupo/i }),
		);

		await waitFor(() => {
			expect(state.updateGroup.mutate).toHaveBeenCalledTimes(1);
		});
		expect(state.updateGroup.mutate.mock.calls[0][0]).toMatchObject({
			payload: { connectionType: "THREE_PHASE", loads },
		});
	});

	it("opens a new residential group on its first pending field", async () => {
		state.createGroup = respondWith({
			id: "101",
			name: "Cobertura",
			kind: "RESIDENTIAL",
			quantity: 2,
			status: "MISSING_DATA",
			issues: [missingData("usefulArea")],
			declaredLoadKw: 0,
			summary: "2 unidades",
		});

		renderPage();
		await submitNewGroup("Cobertura", "Apartamento", "2");

		await waitFor(() => {
			expect(
				screen.getByRole("spinbutton", { name: /Área útil/i }),
			).toHaveFocus();
		});
	});

	it("keeps the line open when the group is not saved", async () => {
		renderPage();
		await submitNewGroup("Administração", "Área comum", "1");

		await waitFor(() => {
			expect(state.createGroup.mutate).toHaveBeenCalledTimes(1);
		});
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		expect(screen.getAllByPlaceholderText("Nome do grupo")[0]).toHaveValue(
			"Administração",
		);
	});

	it.each([
		["Área comum", "Administração", "COMMON_AREA"],
		["Carga comercial", "Salas Comerciais", "COMMERCIAL"],
	] as const)("opens a new %s group on the first load", async (option, name, usage) => {
		state.createGroup = respondWith(
			makeLoadGroup({ name, usage, issues: [missingData("items")] }),
		);

		renderPage();
		await submitNewGroup(name, option, "1");

		await waitFor(() => {
			expect(screen.getByRole("heading", { name })).toBeInTheDocument();
			expect(screen.getByRole("textbox", { name: /Descrição/i })).toHaveFocus();
		});
	});

	it("opens the first load from the missing loads issue", async () => {
		state.groups = [makeLoadGroup({ issues: [missingData("items")] })];

		renderPage();
		fireEvent.click(screen.getByRole("button", { name: "Informar Dado" }));

		await waitFor(() => {
			expect(screen.getByRole("textbox", { name: /Descrição/i })).toHaveFocus();
		});
	});

	it("saves a group without loads opened from the table", async () => {
		state.groups = [makeLoadGroup()];

		renderPage();
		fireEvent.click(
			screen.getAllByRole("button", { name: "Administração" })[0],
		);

		expect(
			await screen.findByText(/Nenhuma carga informada\. Adicione/),
		).toBeInTheDocument();
		expect(
			screen.queryByRole("combobox", { name: /Parcela/i }),
		).not.toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: /Salvar Grupo/i }));

		await waitFor(() => {
			expect(state.updateGroup.mutate).toHaveBeenCalledTimes(1);
		});
		expect(state.updateGroup.mutate.mock.calls[0][0]).toMatchObject({
			payload: { items: [] },
		});
	});

	it("does not invent a load for an analyst", async () => {
		signInAs("reviewer");
		state.project = makeProjectDetail({ id: "4", status: "REJECTED" });
		state.groups = [makeLoadGroup({ issues: [missingData("items")] })];

		renderPage();
		fireEvent.click(screen.getByRole("button", { name: "Informar Dado" }));

		expect(await screen.findByRole("dialog")).toBeInTheDocument();
		expect(
			screen.queryByRole("combobox", { name: /Parcela/i }),
		).not.toBeInTheDocument();
		expect(screen.getByText("Nenhuma carga informada.")).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /Adicionar Carga/i }),
		).not.toBeInTheDocument();
	});

	it("hides the load actions from an analyst", async () => {
		signInAs("reviewer");
		state.project = makeProjectDetail({ id: "4", status: "UNDER_REVIEW" });
		state.groups = [
			makeLoadGroup({
				items: [
					{
						category: "MOTORS",
						description: "Elevador",
						quantity: 1,
						powerUnit: "KW",
					},
				],
			}),
		];

		renderPage();
		fireEvent.click(
			screen.getAllByRole("button", { name: "Administração" })[0],
		);

		expect(await screen.findByDisplayValue("Elevador")).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /Remover Carga/i }),
		).not.toBeInTheDocument();
	});
});
