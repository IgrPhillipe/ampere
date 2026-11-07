import {
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
	Outlet,
	RouterProvider,
} from "@tanstack/react-router";
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useCurrentSection } from "./useCurrentSection";

const CurrentSection = () => {
	const section = useCurrentSection();

	return (
		<>
			<p>{section.key}</p>
			<Outlet />
		</>
	);
};

const renderAt = async (path: string) => {
	const root = createRootRoute({ component: CurrentSection });
	const project = createRoute({
		getParentRoute: () => root,
		path: "/projetos/$id",
	});
	const children = ["/", "dados", "calculo", "memorial", "envio"].map((child) =>
		createRoute({ getParentRoute: () => project, path: child }),
	);
	const router = createRouter({
		routeTree: root.addChildren([project.addChildren(children)]),
		history: createMemoryHistory({ initialEntries: [path] }),
	});

	await act(() => router.load());
	render(<RouterProvider router={router} />);
	await screen.findByRole("paragraph");

	return router;
};

describe("useCurrentSection", () => {
	it("reads the section from the open route", async () => {
		await renderAt("/projetos/4/calculo");

		expect(screen.getByRole("paragraph")).toHaveTextContent("calculation");
	});

	it("falls back to the overview on routes outside the tabs", async () => {
		await renderAt("/projetos/4/envio");

		expect(screen.getByRole("paragraph")).toHaveTextContent("overview");
	});

	// The compiler memoizes this hook, so a stable route reader would keep the first section.
	it("follows client-side navigation", async () => {
		const router = await renderAt("/projetos/4");
		expect(screen.getByRole("paragraph")).toHaveTextContent("overview");

		await act(() =>
			router.navigate({ to: "/projetos/$id/dados", params: { id: "4" } }),
		);
		expect(screen.getByRole("paragraph")).toHaveTextContent("data");

		await act(() =>
			router.navigate({ to: "/projetos/$id/memorial", params: { id: "4" } }),
		);
		expect(screen.getByRole("paragraph")).toHaveTextContent("memorial");
	});
});
