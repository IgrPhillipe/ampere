import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { signInAs } from "@/test/fixtures/project-detail";

import { UsersPage } from "./UsersPage";

const refetch = vi.fn();
const listQuery = vi.hoisted(() => ({
	current: {} as Record<string, unknown>,
}));

vi.mock("@services/users", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/users")>()),
	useGetUserList: () => listQuery.current,
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
});
