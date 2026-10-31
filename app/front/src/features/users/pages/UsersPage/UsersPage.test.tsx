import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { signInAs } from "@/test/fixtures/project-detail";
import { managedUserOf } from "@/test/fixtures/users";

import { UsersPage } from "./UsersPage";

const refetch = vi.fn();
const mockReset = vi.fn();
const listQuery = vi.hoisted(() => ({
	current: {} as Record<string, unknown>,
}));

vi.mock("@services/users", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/users")>()),
	useGetUserList: () => listQuery.current,
	useResetUserPassword: () => ({ mutate: mockReset, isPending: false }),
}));

const renderPage = (searchParams = "") =>
	render(
		<QueryClientProvider client={new QueryClient()}>
			<NuqsTestingAdapter searchParams={searchParams}>
				<UsersPage />
			</NuqsTestingAdapter>
		</QueryClientProvider>,
	);

describe("UsersPage", () => {
	beforeEach(() => {
		signInAs("admin");
		refetch.mockReset();
	});

	it("shows the skeleton while loading", () => {
		listQuery.current = { isPending: true, isError: false };
		renderPage();

		expect(screen.queryByRole("table")).not.toBeInTheDocument();
		expect(
			screen.queryByText("Nenhum usuário cadastrado"),
		).not.toBeInTheDocument();
	});

	it("offers a retry when the list fails", () => {
		listQuery.current = { isPending: false, isError: true, refetch };
		renderPage();

		expect(
			screen.getByText("Não foi possível carregar os usuários"),
		).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Tentar Novamente" }));
		expect(refetch).toHaveBeenCalledOnce();
	});

	it("tells an empty filter from an empty system", () => {
		listQuery.current = {
			isPending: false,
			isError: false,
			data: { data: [], pagination: { total: 0, page: 1, pageSize: 20 } },
		};
		renderPage("?status=inactive");

		expect(
			screen.getByText(
				"Nenhum usuário encontrado para os critérios informados",
			),
		).toBeInTheDocument();
		expect(screen.getByText("Situação: Inativo")).toBeInTheDocument();
	});

	it("shows the new temporary password once after a reset", async () => {
		const user = managedUserOf();
		listQuery.current = {
			isPending: false,
			isError: false,
			data: { data: [user], pagination: { total: 1, page: 1, pageSize: 20 } },
		};
		mockReset.mockImplementation((_id, options) =>
			options.onSuccess({ data: { user, temporaryPassword: "Nova5678" } }),
		);
		renderPage();

		fireEvent.click(
			screen.getAllByRole("button", {
				name: "Ações do usuário Ana Projetista",
			})[0],
		);
		fireEvent.click(
			await screen.findByRole("menuitem", { name: "Redefinir Senha" }),
		);
		fireEvent.click(
			await screen.findByRole("button", { name: "Redefinir Senha" }),
		);

		expect(mockReset).toHaveBeenCalledWith("2", expect.anything());
		expect(await screen.findByText("Nova5678")).toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: "Concluir" }));
		await waitFor(() =>
			expect(screen.queryByText("Nova5678")).not.toBeInTheDocument(),
		);
	});
});
