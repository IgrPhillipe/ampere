import type {
	ConsumerUnitGroup,
	ConsumerUnitGroupResponse,
} from "@services/consumer-units";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
		const createdGroup: ConsumerUnitGroup = {
			id: "101",
			name: "Apartamentos Tipo",
			kind: "RESIDENTIAL",
			quantity: 12,
			status: "VALIDATED",
			summary: "12 unidades",
			unitLoadKw: 15,
			usefulArea: null,
			bedrooms: null,
			compactUnit: null,
		};

		state.createGroup = {
			...idleMutation(),
			mutate: vi.fn((_args, options) => {
				const response: ConsumerUnitGroupResponse = {
					data: createdGroup,
				};
				options?.onSuccess?.(response);
			}),
		};

		renderPage();

		const addButtons = screen.getAllByRole("button", {
			name: /Adicionar Grupo/i,
		});
		fireEvent.click(addButtons[0]);

		const nameInput = screen.getAllByPlaceholderText("Nome do grupo")[0];
		fireEvent.change(nameInput, { target: { value: "Apartamentos Tipo" } });

		await pickUsage("Apartamento");

		const quantityInput = screen.getAllByPlaceholderText("00")[0];
		fireEvent.change(quantityInput, { target: { value: "12" } });

		const saveButton = screen.getAllByRole("button", {
			name: /Salvar Grupo/i,
		})[0];
		fireEvent.click(saveButton);

		await waitFor(() => {
			expect(state.createGroup.mutate).toHaveBeenCalledTimes(1);
			expect(
				screen.getByRole("heading", { name: "Apartamentos Tipo" }),
			).toBeInTheDocument();
		});
	});

	it("saves a common area group and opens the Sheet focusing the first load category", async () => {
		const createdGroup: ConsumerUnitGroup = {
			id: "102",
			name: "Administração",
			kind: "LOAD",
			usage: "COMMON_AREA",
			quantity: 1,
			status: "MISSING_DATA",
			summary: "1 unidade",
			items: [],
		};

		state.createGroup = {
			...idleMutation(),
			mutate: vi.fn((_args, options) => {
				const response: ConsumerUnitGroupResponse = {
					data: createdGroup,
				};
				options?.onSuccess?.(response);
			}),
		};

		renderPage();

		const addButtons = screen.getAllByRole("button", {
			name: /Adicionar Grupo/i,
		});
		fireEvent.click(addButtons[0]);

		const nameInput = screen.getAllByPlaceholderText("Nome do grupo")[0];
		fireEvent.change(nameInput, { target: { value: "Administração" } });

		await pickUsage("Área comum");

		const quantityInput = screen.getAllByPlaceholderText("00")[0];
		fireEvent.change(quantityInput, { target: { value: "1" } });

		const saveButton = screen.getAllByRole("button", {
			name: /Salvar Grupo/i,
		})[0];
		fireEvent.click(saveButton);

		await waitFor(() => {
			expect(state.createGroup.mutate).toHaveBeenCalledTimes(1);
			expect(
				screen.getByRole("heading", { name: "Administração" }),
			).toBeInTheDocument();
		});

		// The sheet is open, and for LOAD groups it defaults to the first empty load item
		// with focus directed to items[0].category.
		await waitFor(() => {
			const selectTrigger = screen.getByRole("combobox", { name: /Parcela/i });
			expect(selectTrigger).toBeInTheDocument();
			expect(document.activeElement).toBe(selectTrigger);
		});
	});

	it("saves a commercial group and opens the Sheet focusing the first load category", async () => {
		const createdGroup: ConsumerUnitGroup = {
			id: "103",
			name: "Salas Comerciais",
			kind: "LOAD",
			usage: "COMMERCIAL",
			quantity: 2,
			status: "MISSING_DATA",
			summary: "2 unidades",
			items: [],
		};

		state.createGroup = {
			...idleMutation(),
			mutate: vi.fn((_args, options) => {
				const response: ConsumerUnitGroupResponse = {
					data: createdGroup,
				};
				options?.onSuccess?.(response);
			}),
		};

		renderPage();

		const addButtons = screen.getAllByRole("button", {
			name: /Adicionar Grupo/i,
		});
		fireEvent.click(addButtons[0]);

		const nameInput = screen.getAllByPlaceholderText("Nome do grupo")[0];
		fireEvent.change(nameInput, { target: { value: "Salas Comerciais" } });

		await pickUsage("Carga comercial");

		const quantityInput = screen.getAllByPlaceholderText("00")[0];
		fireEvent.change(quantityInput, { target: { value: "2" } });

		const saveButton = screen.getAllByRole("button", {
			name: /Salvar Grupo/i,
		})[0];
		fireEvent.click(saveButton);

		await waitFor(() => {
			expect(state.createGroup.mutate).toHaveBeenCalledTimes(1);
			expect(
				screen.getByRole("heading", { name: "Salas Comerciais" }),
			).toBeInTheDocument();
		});

		await waitFor(() => {
			const selectTrigger = screen.getByRole("combobox", { name: /Parcela/i });
			expect(selectTrigger).toBeInTheDocument();
			expect(document.activeElement).toBe(selectTrigger);
		});
	});
});
