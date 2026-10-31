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
	update: undefined as unknown as ReturnType<typeof idleMutation>,
}));

vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => vi.fn(),
	Link: ({ children }: { children: ReactNode }) => <a href="/">{children}</a>,
}));

vi.mock("@services/projects", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/projects")>()),
	useGetProject: () => loadedQuery({ data: state.project }),
	useCreateProject: () => idleMutation(),
	useUpdateProject: () => state.update,
}));

vi.mock("@services/project-review", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/project-review")>()),
	useGetFindingList: () => loadedQuery({ data: [] }),
}));

vi.mock("@services/locations", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/locations")>()),
	useGetPostalCodeAddress: () => loadedQuery(undefined),
}));

vi.mock("@services/users/requests", () => ({
	getUserList: vi.fn().mockResolvedValue({
		data: [],
		pagination: { total: 0, page: 1, pageSize: 20 },
	}),
}));

const renderPage = (projectId?: string) =>
	render(
		<QueryClientProvider client={new QueryClient()}>
			<ProjectDataPage projectId={projectId} />
		</QueryClientProvider>,
	);

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
		state.update = idleMutation();
	});

	it("asks the administrator for the designer when creating", () => {
		signInAs("admin");
		renderPage();

		expect(ownerField()).toBeEnabled();
		expect(screen.getByText("00/11")).toBeInTheDocument();
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
