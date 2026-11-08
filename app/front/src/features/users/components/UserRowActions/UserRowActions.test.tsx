import type { ManagedUser } from "@services/users";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { managedUserOf } from "@/test/fixtures/users";

import { UserRowActions } from "./UserRowActions";

const renderActions = (user: ManagedUser, isCurrentUser = false) => {
	const handlers = {
		onEdit: vi.fn(),
		onResetPassword: vi.fn(),
		onToggleActive: vi.fn(),
	};
	render(
		<UserRowActions user={user} isCurrentUser={isCurrentUser} {...handlers} />,
	);

	return handlers;
};

describe("UserRowActions", () => {
	it("offers edit, password reset and deactivation for an active account", () => {
		const user = managedUserOf();
		const handlers = renderActions(user);

		expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Redefinir Senha" }),
		).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "Reativar" }),
		).not.toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: "Desativar" }));
		expect(handlers.onToggleActive).toHaveBeenCalledWith(user);
	});

	it("offers reactivation for an inactive account", () => {
		renderActions(managedUserOf({ active: false }));

		expect(
			screen.getByRole("button", { name: "Reativar" }),
		).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "Desativar" }),
		).not.toBeInTheDocument();
	});

	it("keeps the administrator from deactivating or resetting their own account", () => {
		renderActions(managedUserOf({ id: "1", role: "admin" }), true);

		expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument();
		expect(screen.getByText("Conta própria")).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "Desativar" }),
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "Redefinir Senha" }),
		).not.toBeInTheDocument();
	});
});
