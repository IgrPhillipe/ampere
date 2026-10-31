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

import { ProjectDataPage } from "./ProjectDataPage";

const state = vi.hoisted(() => ({
	project: undefined as unknown,
	create: undefined as unknown as ReturnType<typeof idleMutation>,
	update: undefined as unknown as ReturnType<typeof idleMutation>,
}));

vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => vi.fn(),
	Link: ({ children }: { children: ReactNode }) => <a href="/">{children}</a>,
}));

vi.mock("@services/projects", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/projects")>()),
	useGetProject: () => loadedQuery({ data: state.project }),
	useCreateProject: () => state.create,
	useUpdateProject: () => state.update,
}));

vi.mock("@services/project-review", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/project-review")>()),
	useGetFindingList: () => loadedQuery({ data: [] }),
}));

vi.mock("@services/locations", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/locations")>()),
	useGetPostalCodeAddress: (digits: string) =>
		loadedQuery(
			digits.length === 8
				? { ibge: "2611606", logradouro: "Cais do Apolo", bairro: "Recife" }
				: undefined,
		),
}));

vi.mock("@services/users/requests", () => ({
	getUserList: vi.fn().mockResolvedValue({
		data: [
			{
				id: "5",
				name: "Carla Projetista",
				email: "projetista@ampere.com",
				role: "user",
				active: true,
				mustChangePassword: false,
				lastLoginAt: null,
				createdAt: "2026-10-01T10:00:00-03:00",
			},
		],
		pagination: { total: 1, page: 1, pageSize: 20 },
	}),
}));

const renderPage = (projectId?: string) =>
	render(
		<QueryClientProvider client={new QueryClient()}>
			<ProjectDataPage projectId={projectId} />
		</QueryClientProvider>,
	);

const pick = async (field: RegExp | string, option: string) => {
	fireEvent.click(screen.getByRole("combobox", { name: field }));
	const item = await screen.findByRole("option", { name: option });
	// Base UI's select only commits a mouse click that started on the item.
	fireEvent.pointerDown(item);
	fireEvent.click(item);
	await waitFor(() => expect(screen.queryAllByRole("option")).toHaveLength(0));
};

const ownerField = () => screen.queryByRole("combobox", { name: /Projetista/ });

describe("ProjectDataPage", () => {
	beforeEach(() => {
		vi.stubGlobal(
			"IntersectionObserver",
			class {
				observe = vi.fn();
				disconnect = vi.fn();
			},
		);
		state.project = undefined;
		state.create = idleMutation();
		state.update = idleMutation();
	});

	it("asks the administrator for the designer when creating", () => {
		signInAs("admin");
		renderPage();

		expect(ownerField()).toBeEnabled();
		expect(screen.getByText("00/11")).toBeInTheDocument();
	});

	it("creates the project in the name of the designer the administrator picks", async () => {
		signInAs("admin");
		renderPage();

		await pick(/Projetista/, "Carla Projetista");
		fireEvent.change(screen.getByPlaceholderText("Digite o nome do projeto"), {
			target: { value: "Residencial Boa Vista" },
		});
		fireEvent.change(screen.getByPlaceholderText("00000-000"), {
			target: { value: "50030230" },
		});
		fireEvent.change(screen.getByPlaceholderText("Ex.: 8"), {
			target: { value: "6" },
		});
		await pick(/Tipo de edificação/, "Residencial multifamiliar");
		await pick(/Tensão de fornecimento/, "380/220 V");
		await pick(/Tipo de ligação/, "Trifásico");
		await pick(/Padrão de entrada/, "Coletivo");

		await waitFor(() => expect(screen.getByText("11/11")).toBeInTheDocument());
		fireEvent.click(
			screen.getByRole("button", { name: /Avançar para Unidades/ }),
		);

		await waitFor(() => expect(state.create.mutate).toHaveBeenCalled());
		expect(state.create.mutate).toHaveBeenCalledWith(
			expect.objectContaining({
				ownerId: "5",
				name: "Residencial Boa Vista",
				municipality: "Recife",
				state: "PE",
			}),
			expect.anything(),
		);
	});

	it("leaves the designer field out for the designer", () => {
		signInAs("user");
		renderPage();

		expect(ownerField()).not.toBeInTheDocument();
		expect(screen.getByText("00/10")).toBeInTheDocument();
	});

	it("shows the owner without letting the administrator change it", async () => {
		signInAs("admin");
		state.project = makeProjectDetail({
			status: "DRAFT",
			ownerId: "5",
			ownerName: "Carla Projetista",
		});
		renderPage("4");

		expect(ownerField()).toBeDisabled();
		expect(ownerField()).toHaveTextContent("Carla Projetista");
		expect(screen.getByText("10/10")).toBeInTheDocument();

		fireEvent.change(screen.getByPlaceholderText("Digite o nome do projeto"), {
			target: { value: "Residencial Boa Vista II" },
		});
		fireEvent.click(
			screen.getByRole("button", { name: /Avançar para Unidades/ }),
		);

		await waitFor(() => expect(state.update.mutate).toHaveBeenCalled());
		expect(state.update.mutate).toHaveBeenCalledWith(
			{
				id: "4",
				payload: expect.not.objectContaining({ ownerId: expect.anything() }),
			},
			expect.anything(),
		);
	});
});
