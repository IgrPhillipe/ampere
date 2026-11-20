import { useAuthStore } from "@features/shared";
import { render, screen, within } from "@testing-library/react";
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

	it("leaves the analysis areas out of the admin's header", () => {
		signInAs("admin");
		render(<HeaderNav />);

		const nav = screen.getByRole("navigation", {
			name: "Navegação principal",
		});
		for (const name of ["Fila de Análise", "Indicadores", "Meus Pareceres"]) {
			expect(within(nav).queryByRole("link", { name })).not.toBeInTheDocument();
		}
		expect(
			within(nav).queryByRole("button", { name: "Análise" }),
		).not.toBeInTheDocument();
		expect(
			within(nav).getByRole("link", { name: "Projetos" }),
		).toBeInTheDocument();
	});

	it("keeps the analyst's areas in the header itself", () => {
		signInAs("reviewer");
		render(<HeaderNav />);

		expect(
			screen.getByRole("link", { name: "Meus Pareceres" }),
		).toBeInTheDocument();
	});
});
