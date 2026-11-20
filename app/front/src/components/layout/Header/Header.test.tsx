import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import { signInAs } from "@/test/fixtures/project-detail";

import { Header } from "./Header";

vi.mock("@services/auth", () => ({ useLogout: () => vi.fn() }));

vi.mock("./NotificationsMenu", () => ({ NotificationsMenu: () => null }));

vi.mock("./HeaderNav", () => ({ HeaderNav: () => null }));

vi.mock("./AppBrand", () => ({ AppBrand: () => null }));

vi.mock("@tanstack/react-router", () => ({
	Link: ({ to, ...props }: ComponentProps<"a"> & { to: string }) => (
		<a href={to} {...props} />
	),
}));

describe("Header", () => {
	it("names the user and the role even when only the avatar shows", async () => {
		signInAs("admin", { name: "Admin Teste", email: "admin@ampere.com" });
		render(<Header />);

		const trigger = screen.getByRole("button", {
			name: "Admin Teste, Gestor",
		});
		expect(screen.getByText("AT").closest("[data-slot=avatar]")).toHaveClass(
			"md:hidden",
			"lg:flex",
			"xl:hidden",
		);

		fireEvent.click(trigger);

		const menu = await screen.findByRole("menu");
		expect(within(menu).getByText("Admin Teste")).toBeInTheDocument();
		expect(within(menu).getByText("Gestor")).toBeInTheDocument();
		expect(within(menu).getByText("admin@ampere.com")).toBeInTheDocument();
	});
});
