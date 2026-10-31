import type { ManagedUser } from "@services/users";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { managedUserOf } from "@/test/fixtures/users";

import { UserRowActions } from "./UserRowActions";

const openMenu = (user: ManagedUser, isCurrentUser = false) => {
	const handlers = {
		onEdit: vi.fn(),
		onResetPassword: vi.fn(),
		onToggleActive: vi.fn(),
	};
	render(
		<UserRowActions user={user} isCurrentUser={isCurrentUser} {...handlers} />,
	);
	fireEvent.click(
		screen.getByRole("button", { name: `Ações do usuário ${user.name}` }),
	);

	return handlers;
};

describe("UserRowActions", () => {
	it("offers edit, password reset and deactivation for an active account", async () => {
		const user = managedUserOf();
		const handlers = openMenu(user);

		expect(
			await screen.findByRole("menuitem", { name: "Editar" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("menuitem", { name: "Redefinir Senha" }),
		).toBeInTheDocument();
		expect(
			screen.queryByRole("menuitem", { name: "Reativar" }),
		).not.toBeInTheDocument();

		fireEvent.click(screen.getByRole("menuitem", { name: "Desativar" }));
		expect(handlers.onToggleActive).toHaveBeenCalledWith(user);
	});

	it("offers reactivation for an inactive account", async () => {
		openMenu(managedUserOf({ active: false }));

		expect(
			await screen.findByRole("menuitem", { name: "Reativar" }),
		).toBeInTheDocument();
		expect(
			screen.queryByRole("menuitem", { name: "Desativar" }),
		).not.toBeInTheDocument();
	});

	it("does not let the administrator deactivate their own account", async () => {
		openMenu(managedUserOf({ id: "1", role: "admin" }), true);

		expect(
			await screen.findByRole("menuitem", { name: "Editar" }),
		).toBeInTheDocument();
		expect(
			screen.queryByRole("menuitem", { name: "Desativar" }),
		).not.toBeInTheDocument();
	});
});
