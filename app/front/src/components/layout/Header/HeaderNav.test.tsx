import { useAuthStore } from "@features/shared";
import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { signInAs } from "@/test/fixtures/project-detail";

import { HeaderNav } from "./HeaderNav";

const state = vi.hoisted(() => ({ path: "/indicadores" }));

vi.mock("@tanstack/react-router", () => ({
	Link: ({
		to,
		activeOptions: _,
		activeProps: __,
		...props
	}: ComponentProps<"a"> & {
		to: string;
		activeOptions?: unknown;
		activeProps?: unknown;
	}) => <a href={to} {...props} />,
	useMatchRoute:
		() =>
		({ to }: { to: string }) =>
			to === state.path ? {} : false,
}));

describe("HeaderNav", () => {
	afterEach(() => useAuthStore.getState().logout());

	it("opens the admin's analysis areas from one menu", async () => {
		signInAs("admin");
		render(<HeaderNav />);

		const nav = screen.getByRole("navigation", {
			name: "Navegação principal",
		});
		expect(
			within(nav).queryByRole("link", { name: "Indicadores" }),
		).not.toBeInTheDocument();

		const trigger = within(nav).getByRole("button", { name: "Análise" });
		expect(trigger).toHaveClass("text-foreground");

		fireEvent.click(trigger);

		const menu = await screen.findByRole("menu");
		expect(
			within(menu).getByRole("menuitem", { name: "Distribuição" }),
		).toHaveAttribute("href", "/distribuicao");
		expect(
			within(menu).getByRole("menuitem", { name: "Indicadores" }),
		).toHaveClass("font-medium");
	});

	it("lists every area flat in the mobile sheet", () => {
		signInAs("admin");
		render(<HeaderNav orientation="vertical" />);

		expect(screen.getByRole("link", { name: "Indicadores" })).toHaveAttribute(
			"href",
			"/indicadores",
		);
		expect(
			screen.queryByRole("button", { name: "Análise" }),
		).not.toBeInTheDocument();
	});

	it("keeps the analyst's areas in the header itself", () => {
		signInAs("reviewer");
		render(<HeaderNav />);

		expect(
			screen.getByRole("link", { name: "Meus Pareceres" }),
		).toBeInTheDocument();
	});
});
