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

	it.each([
		["Área comum", "Administração", "COMMON_AREA"],
		["Carga comercial", "Salas Comerciais", "COMMERCIAL"],
	] as const)("saves a %s group and opens the Sheet focusing the first load category", async (option, name, usage) => {
		state.createGroup = respondWith(makeLoadGroup({ name, usage }));

		renderPage();
		await submitNewGroup(name, option, "1");

		await waitFor(() => {
			expect(state.createGroup.mutate).toHaveBeenCalledTimes(1);
			expect(screen.getByRole("heading", { name })).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.getByRole("combobox", { name: /Parcela/i })).toHaveFocus();
		});
	});
});
