import { useAuthStore } from "@features/shared";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { signInAs } from "@/test/fixtures/project-detail";
import { managedUserOf } from "@/test/fixtures/users";

import { UsersTable } from "./UsersTable";

const actions = () => ({
	onEdit: vi.fn(),
	onResetPassword: vi.fn(),
	onToggleActive: vi.fn(),
});

const desktopTable = () => within(screen.getByRole("table"));

describe("UsersTable", () => {
	afterEach(() => useAuthStore.getState().logout());

	it("shows role, status and last access of each account", () => {
		render(
			<UsersTable
				users={[
					managedUserOf(),
					managedUserOf({
						id: "3",
						name: "Bruno Analista",
						role: "reviewer",
						active: false,
						lastLoginAt: null,
					}),
				]}
			/>,
		);
		const table = desktopTable();

		expect(table.getByText("Projetista")).toBeInTheDocument();
		expect(table.getByText("Analista")).toBeInTheDocument();
		expect(table.getByText("Ativo")).toBeInTheDocument();
		expect(table.getByText("Inativo")).toBeInTheDocument();
		expect(table.getByText("30/10/2026 às 13:45")).toBeInTheDocument();
		expect(table.getByText("Nunca acessou")).toBeInTheDocument();
	});

	it("flags an active account still on its temporary password", () => {
		render(
			<UsersTable
				users={[
					managedUserOf({ mustChangePassword: true }),
					managedUserOf({ id: "3", active: false, mustChangePassword: true }),
				]}
			/>,
		);

		expect(desktopTable().getAllByText("Troca Pendente")).toHaveLength(1);
	});

	it("opens the edit from the row", () => {
		const handlers = actions();
		render(<UsersTable users={[managedUserOf()]} actions={handlers} />);

		fireEvent.click(desktopTable().getByText("Ana Projetista"));

		expect(handlers.onEdit).toHaveBeenCalledWith(managedUserOf());
	});

	it("marks the signed-in administrator", () => {
		signInAs("admin");
		render(<UsersTable users={[managedUserOf({ id: "1", role: "admin" })]} />);

		expect(desktopTable().getByText("(você)")).toBeInTheDocument();
	});

	it("offers to clear the filters when they leave no account", () => {
		const onClearFilters = vi.fn();
		render(<UsersTable users={[]} onClearFilters={onClearFilters} />);

		fireEvent.click(screen.getByRole("button", { name: "Limpar Filtros" }));

		expect(onClearFilters).toHaveBeenCalledOnce();
	});

	it("asks for the first account without filters", () => {
		const onCreate = vi.fn();
		render(<UsersTable users={[]} onCreate={onCreate} />);

		expect(screen.getByText("Nenhum usuário cadastrado")).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Novo Usuário" }));
		expect(onCreate).toHaveBeenCalledOnce();
	});
});
