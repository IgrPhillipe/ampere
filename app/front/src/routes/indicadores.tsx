import { createFileRoute, redirect } from "@tanstack/react-router";

/** The analyst's indicators moved into "Painel": old links land there. */
export const Route = createFileRoute("/indicadores")({
	beforeLoad: () => {
		throw redirect({ to: "/painel" });
	},
});
