import { createFileRoute, redirect } from "@tanstack/react-router";

/** The decided projects moved into "Projetos": old links and notices land there. */
export const Route = createFileRoute("/meus-pareceres")({
	beforeLoad: () => {
		throw redirect({ to: "/projetos", search: { filter: "APPROVED" } });
	},
});
