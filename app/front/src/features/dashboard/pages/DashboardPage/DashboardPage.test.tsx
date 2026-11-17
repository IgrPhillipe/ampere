import { type UserRole, useAuthStore } from "@features/shared";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DashboardPage } from "./DashboardPage";

vi.mock("../AdminDashboardPage", () => ({
	AdminDashboardPage: () => <p>Painel do gestor</p>,
}));

vi.mock("../DesignerDashboardPage", () => ({
	DesignerDashboardPage: () => <p>Painel do projetista</p>,
}));

const signInAs = (role: UserRole) =>
	useAuthStore.getState().login({
		id: "1",
		name: "Teste",
		email: "teste@ampere.com",
		role,
		mustChangePassword: false,
		token: "token",
	});

describe("DashboardPage", () => {
	afterEach(() => useAuthStore.getState().logout());

	it("shows the admin their own panel", () => {
		signInAs("admin");
		render(<DashboardPage />);

		expect(screen.getByText("Painel do gestor")).toBeInTheDocument();
	});

	it("keeps the designer on the designer panel", () => {
		signInAs("user");
		render(<DashboardPage />);

		expect(screen.getByText("Painel do projetista")).toBeInTheDocument();
	});
});
