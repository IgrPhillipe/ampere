import { createFileRoute, redirect } from "@tanstack/react-router";

/** The queue moved into "Projetos": old links and notices land there. */
export const Route = createFileRoute("/fila-de-analise/")({
	beforeLoad: () => {
		throw redirect({ to: "/projetos" });
	},
});
